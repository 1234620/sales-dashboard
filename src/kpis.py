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
    KPI 4: Year-over-Year revenue growth.

    Returns DataFrame with columns: month, year, revenue, yoy_growth_pct
    """
    monthly = (
        df.groupby(["year", "month"])["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"net_revenue": "revenue"})
        .sort_values(["year", "month"])
    )

    # Pivot to get years as columns, then compute YoY
    pivot = monthly.pivot(index="month", columns="year", values="revenue")
    yoy = pd.DataFrame()
    for i, year in enumerate(sorted(pivot.columns)):
        if i > 0:
            prev_year = sorted(pivot.columns)[i - 1]
            yoy[f"{year}_vs_{prev_year}"] = (
                (pivot[year] - pivot[prev_year]) / pivot[prev_year] * 100
            )
    return yoy


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

    Returns DataFrame with columns: product_category, revenue, margin, margin_pct
    """
    cats = df.groupby("product_category").agg(
        revenue=("net_revenue", "sum"),
        gross=("gross_revenue", "sum") if "gross_revenue" in df.columns else ("net_revenue", "sum"),
    ).reset_index()

    cats["discounts"] = cats["gross"] - cats["revenue"]
    cats["fulfillment"] = cats["revenue"] * config.FULFILLMENT_COST_RATE
    cats["margin"] = cats["revenue"] - cats["discounts"] - cats["fulfillment"]
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

def anomaly_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    KPI 14: Anomaly detection via Z-score on daily revenue.

    Returns DataFrame with columns: date, daily_revenue, rolling_mean, z_score, is_anomaly
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

    daily["is_anomaly"] = daily["z_score"].abs() > config.ZSCORE_THRESHOLD
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
        festive_days = festive_mask.sum()
        normal_rev = df.loc[~festive_mask, "net_revenue"].sum()
        normal_days = (~festive_mask).sum()

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
