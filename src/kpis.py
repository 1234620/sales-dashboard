"""
KPI computation functions for the Sales Dashboard.

All 16 KPIs are implemented as pure functions that take a DataFrame
and return a scalar or Series. No side effects, no Streamlit calls.
This makes them testable in isolation.
"""

import pandas as pd
import numpy as np
from scipy import stats

import config


# ── Revenue KPIs ────────────────────────────────────────────────────────────

def total_revenue(df: pd.DataFrame) -> float:
    """KPI 1: Total net revenue."""
    return df["net_revenue"].sum()


def contribution_margin(df: pd.DataFrame) -> float:
    """
    KPI 2: Contribution Margin.

    Revenue minus estimated costs:
    - Discounts given (gross - net)
    - Returns (net_revenue of returned orders)
    - Fulfillment (estimated at FULFILLMENT_COST_RATE of net revenue)
    """
    revenue = df["net_revenue"].sum()

    # Discount impact
    if "gross_revenue" in df.columns:
        discount_total = df["gross_revenue"].sum() - revenue
    else:
        discount_total = 0

    # Returns
    if "return_flag" in df.columns:
        returns_total = df.loc[df["return_flag"] == True, "net_revenue"].sum()
    else:
        returns_total = 0

    # Estimated fulfillment
    fulfillment = revenue * config.FULFILLMENT_COST_RATE

    return revenue - discount_total - returns_total - fulfillment


def mom_growth(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 3: Month-over-Month revenue growth.

    Returns DataFrame with columns: year_month, revenue, mom_growth_pct
    """
    monthly = (
        df.groupby("year_month")["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "revenue"})
        .sort_values("year_month")
    )
    monthly["mom_growth_pct"] = monthly["revenue"].pct_change() * 100
    return monthly


def yoy_growth(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 4: Year-over-Year revenue growth (chart-friendly series).

    Compares the latest year in the data to the immediately prior year.
    Returns DataFrame with columns: month, label, yoy_growth_pct, current_revenue, prior_revenue
    """
    month_labels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]

    monthly = (
        df.groupby(["year", "month"])["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "revenue"})
    )

    years = sorted(monthly["year"].unique())
    if len(years) < 2:
        return pd.DataFrame(
            columns=["month", "label", "yoy_growth_pct", "current_revenue", "prior_revenue"]
        )

    current_year = int(years[-1])
    prior_year = int(years[-2])

    rows = []
    for month in range(1, 13):
        curr_row = monthly[(monthly["year"] == current_year) & (monthly["month"] == month)]
        prior_row = monthly[(monthly["year"] == prior_year) & (monthly["month"] == month)]
        current_rev = float(curr_row["revenue"].sum()) if not curr_row.empty else 0.0
        prior_rev = float(prior_row["revenue"].sum()) if not prior_row.empty else 0.0

        if prior_rev > 0:
            yoy_pct = (current_rev - prior_rev) / prior_rev * 100
        else:
            yoy_pct = None

        rows.append({
            "month": month,
            "label": month_labels[month - 1],
            "yoy_growth_pct": yoy_pct,
            "current_revenue": current_rev,
            "prior_revenue": prior_rev,
        })

    return pd.DataFrame(rows)


def average_order_value(df: pd.DataFrame) -> float:
    """KPI 5: Average Order Value (AOV)."""
    n_orders = df["transaction_id"].nunique()
    if n_orders == 0:
        return 0.0
    return df["net_revenue"].sum() / n_orders


def discount_impact_rate(df: pd.DataFrame) -> float:
    """KPI 6: Discount Impact Rate — total discounts / gross revenue."""
    if "gross_revenue" not in df.columns:
        return 0.0
    gross = df["gross_revenue"].sum()
    if gross == 0:
        return 0.0
    net = df["net_revenue"].sum()
    return (gross - net) / gross


# ── Product & Category KPIs ─────────────────────────────────────────────────

def return_rate_by_category(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 7: Return rate by product category.

    Returns DataFrame with columns: product_category, total_units, returned_units, return_rate
    """
    if "return_flag" not in df.columns:
        return pd.DataFrame(columns=["product_category", "return_rate"])

    cat_stats = df.groupby("product_category").agg(
        total_units=("quantity", "sum"),
        returned_units=("return_flag", "sum"),
    ).reset_index()
    cat_stats["return_rate"] = cat_stats["returned_units"] / cat_stats["total_units"]
    return cat_stats.sort_values("return_rate", ascending=False)


def regional_revenue_share(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 8: Revenue share by region.

    Returns DataFrame with columns: region, revenue, share_pct
    """
    total = df["net_revenue"].sum()
    regional = (
        df.groupby("region")["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "revenue"})
    )
    regional["share_pct"] = (regional["revenue"] / total * 100) if total > 0 else 0
    return regional.sort_values("revenue", ascending=False)


def category_contribution_margin(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 9: Contribution margin by product category.

    Revenue is net (post-discount). Margin = net revenue - returns - fulfillment estimate.
    Returns DataFrame with columns: product_category, revenue, margin, margin_pct
    """
    cats = (
        df.groupby("product_category", observed=True)
        .agg(revenue=("net_revenue", "sum"))
        .reset_index()
    )
    cats["product_category"] = cats["product_category"].astype(str)

    if "return_flag" in df.columns:
        returns = (
            df.loc[df["return_flag"] == True]
            .groupby("product_category", observed=True)["net_revenue"]
            .sum()
        )
        returns_by_category = {str(k): float(v) for k, v in returns.items()}
        cats["returns_total"] = cats["product_category"].map(
            lambda cat: returns_by_category.get(cat, 0.0)
        )
    else:
        cats["returns_total"] = 0.0

    cats["returns_total"] = cats["returns_total"].astype(float)
    cats["revenue"] = cats["revenue"].astype(float)

    cats["fulfillment"] = cats["revenue"] * config.FULFILLMENT_COST_RATE
    cats["margin"] = cats["revenue"] - cats["returns_total"] - cats["fulfillment"]
    cats["margin_pct"] = (cats["margin"] / cats["revenue"] * 100).fillna(0)

    return cats[["product_category", "revenue", "margin", "margin_pct"]].sort_values(
        "margin", ascending=False
    )


def sales_velocity(df: pd.DataFrame) -> float:
    """KPI 10: Sales Velocity — average daily revenue in the selected period."""
    if df.empty:
        return 0.0
    date_range = (df["date"].max() - df["date"].min()).days
    if date_range == 0:
        return df["net_revenue"].sum()
    return df["net_revenue"].sum() / date_range


def repeat_purchase_rate(df: pd.DataFrame) -> float:
    """KPI 11: Repeat Purchase Rate — % of transactions from repeat customers."""
    if "customer_id" not in df.columns:
        return 0.0
    customer_txns = df.groupby("customer_id")["transaction_id"].nunique()
    repeat_customers = customer_txns[customer_txns > 1].index
    repeat_txns = df[df["customer_id"].isin(repeat_customers)].shape[0]
    return (repeat_txns / len(df) * 100) if len(df) > 0 else 0.0


def top_bottom_skus(df: pd.DataFrame, n: int = 10) -> tuple:
    """
    KPI 12: Top and bottom SKUs by revenue.

    Returns:
        (top_df, bottom_df) — each with columns: product_sku, revenue, quantity
    """
    sku_stats = (
        df.groupby("product_sku")
        .agg(revenue=("net_revenue", "sum"), quantity=("quantity", "sum"))
        .reset_index()
        .sort_values("revenue", ascending=False)
    )
    return sku_stats.head(n), sku_stats.tail(n)


# ── Anomaly & Trend KPIs ───────────────────────────────────────────────────

def _is_festive_calendar_day(dt) -> bool:
    """True if the date falls in any configured festive window."""
    if pd.isna(dt):
        return False
    ts = pd.Timestamp(dt)
    for window in config.FESTIVE_WINDOWS.values():
        if (
            ts.month == window["month"]
            and window["day_start"] <= ts.day <= window["day_end"]
        ):
            return True
    return False


def anomaly_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 14: Anomaly detection via Z-score on daily revenue.

    Flags a day when ALL of the following hold:
    - |z-score| > ZSCORE_THRESHOLD
    - |daily revenue − rolling mean| >= ANOMALY_MIN_REVENUE_DELTA
    - not in a festive window (when ANOMALY_EXCLUDE_FESTIVE_DAYS is True)

    Returns DataFrame with columns:
    date, daily_revenue, rolling_mean, z_score, revenue_deviation, is_anomaly
    """
    daily = (
        df.groupby("date")["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "daily_revenue"})
        .sort_values("date")
    )
    daily["rolling_mean"] = daily["daily_revenue"].rolling(
        window=config.ROLLING_WINDOW_SHORT, min_periods=7
    ).mean()
    daily["rolling_std"] = daily["daily_revenue"].rolling(
        window=config.ROLLING_WINDOW_SHORT, min_periods=7
    ).std()

    daily["z_score"] = (
        (daily["daily_revenue"] - daily["rolling_mean"]) / daily["rolling_std"]
    ).fillna(0)

    daily["revenue_deviation"] = (
        daily["daily_revenue"] - daily["rolling_mean"]
    ).abs()

    zscore_flag = daily["z_score"].abs() > config.ZSCORE_THRESHOLD
    delta_flag = daily["revenue_deviation"] >= config.ANOMALY_MIN_REVENUE_DELTA

    if config.ANOMALY_EXCLUDE_FESTIVE_DAYS:
        festive_flag = daily["date"].apply(_is_festive_calendar_day)
        daily["is_anomaly"] = zscore_flag & delta_flag & ~festive_flag
    else:
        daily["is_anomaly"] = zscore_flag & delta_flag

    return daily


def festive_season_uplift(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 15: Revenue uplift during festive windows vs. normal periods.

    Returns DataFrame with columns: festival, festive_daily_avg, normal_daily_avg, uplift_pct
    """
    results = []
    for festival, window in config.FESTIVE_WINDOWS.items():
        festive_mask = (
            (df["date"].dt.month == window["month"])
            & (df["date"].dt.day >= window["day_start"])
            & (df["date"].dt.day <= window["day_end"])
        )
        festive_rev = df.loc[festive_mask, "net_revenue"].sum()
        festive_days = df.loc[festive_mask, "date"].nunique()
        normal_rev = df.loc[~festive_mask, "net_revenue"].sum()
        normal_days = df.loc[~festive_mask, "date"].nunique()

        festive_avg = festive_rev / max(festive_days, 1)
        normal_avg = normal_rev / max(normal_days, 1)
        uplift = ((festive_avg - normal_avg) / max(normal_avg, 1)) * 100

        results.append({
            "festival": festival,
            "festive_daily_avg": festive_avg,
            "normal_daily_avg": normal_avg,
            "uplift_pct": uplift,
        })
    return pd.DataFrame(results)


def channel_mix(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 16: Online vs Offline revenue split.

    Returns DataFrame with columns: channel, revenue, share_pct
    """
    if "channel" not in df.columns:
        return pd.DataFrame(columns=["channel", "revenue", "share_pct"])

    total = df["net_revenue"].sum()
    ch = (
        df.groupby("channel")["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "revenue"})
    )
    ch["share_pct"] = (ch["revenue"] / total * 100) if total > 0 else 0
    return ch
