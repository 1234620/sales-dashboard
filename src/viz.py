"""
Visualization functions for the Sales Dashboard.

Each function returns a Plotly figure object, ready to be rendered
with st.plotly_chart(). No Streamlit calls inside these functions.
"""

import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np

import config


# ── Color Palette ───────────────────────────────────────────────────────────
COLORS = {
    "primary": "#6366F1",       # Indigo
    "secondary": "#8B5CF6",     # Violet
    "success": "#10B981",       # Emerald
    "warning": "#F59E0B",       # Amber
    "danger": "#EF4444",        # Red
    "info": "#3B82F6",          # Blue
    "neutral": "#6B7280",       # Gray
}

CATEGORY_COLORS = px.colors.qualitative.Set2
REGION_COLORS = px.colors.qualitative.Pastel


def _apply_dark_layout(fig: go.Figure, title: str = "") -> go.Figure:
    """Apply consistent dark theme to all charts."""
    fig.update_layout(
        template="plotly_dark",
        title=dict(text=title, font=dict(size=18, color="#E5E7EB")),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter, sans-serif", color="#D1D5DB"),
        margin=dict(l=40, r=40, t=60, b=40),
        legend=dict(
            bgcolor="rgba(0,0,0,0)",
            bordercolor="rgba(255,255,255,0.1)",
            font=dict(size=11),
        ),
    )
    fig.update_xaxes(gridcolor="rgba(255,255,255,0.06)", zeroline=False)
    fig.update_yaxes(gridcolor="rgba(255,255,255,0.06)", zeroline=False)
    return fig


# ── KPI Cards ───────────────────────────────────────────────────────────────

def kpi_card_data(label: str, value: float, delta: float = None, prefix: str = "₹", suffix: str = "") -> dict:
    """
    Prepare data for a Streamlit metric card.

    Returns dict with keys: label, value_str, delta_str, delta_color
    """
    if abs(value) >= 1_00_00_000:  # 1 Crore
        value_str = f"{prefix}{value / 1_00_00_000:.2f} Cr{suffix}"
    elif abs(value) >= 1_00_000:   # 1 Lakh
        value_str = f"{prefix}{value / 1_00_000:.2f} L{suffix}"
    elif abs(value) >= 1_000:
        value_str = f"{prefix}{value / 1_000:.1f}K{suffix}"
    else:
        value_str = f"{prefix}{value:,.0f}{suffix}"

    delta_str = None
    delta_color = "normal"
    if delta is not None:
        delta_str = f"{delta:+.1f}%"
        delta_color = "normal" if delta >= 0 else "inverse"

    return {
        "label": label,
        "value_str": value_str,
        "delta_str": delta_str,
        "delta_color": delta_color,
    }


# ── Revenue Charts ──────────────────────────────────────────────────────────

def revenue_trend_chart(mom_df: pd.DataFrame) -> go.Figure:
    """Line chart of monthly revenue with MoM growth."""
    fig = make_subplots(specs=[[{"secondary_y": True}]])

    fig.add_trace(
        go.Bar(
            x=mom_df["year_month"],
            y=mom_df["revenue"],
            name="Revenue",
            marker_color=COLORS["primary"],
            opacity=0.7,
        ),
        secondary_y=False,
    )

    fig.add_trace(
        go.Scatter(
            x=mom_df["year_month"],
            y=mom_df["mom_growth_pct"],
            name="MoM Growth %",
            line=dict(color=COLORS["success"], width=2),
            mode="lines+markers",
            marker=dict(size=5),
        ),
        secondary_y=True,
    )

    fig.update_yaxes(title_text="Revenue (₹)", secondary_y=False)
    fig.update_yaxes(title_text="MoM Growth %", secondary_y=True)

    return _apply_dark_layout(fig, "Monthly Revenue & Growth Trend")


def regional_revenue_chart(regional_df: pd.DataFrame) -> go.Figure:
    """Horizontal bar chart of revenue by region."""
    fig = px.bar(
        regional_df.sort_values("revenue"),
        x="revenue",
        y="region",
        orientation="h",
        color="share_pct",
        color_continuous_scale="Viridis",
        labels={"revenue": "Revenue (₹)", "share_pct": "Share %"},
    )
    return _apply_dark_layout(fig, "Revenue by Region")


def regional_map_chart(regional_df: pd.DataFrame) -> go.Figure:
    """
    Pie chart as a fallback for regional distribution.
    (Full choropleth requires custom India GeoJSON — can be added later.)
    """
    fig = px.pie(
        regional_df,
        values="revenue",
        names="region",
        color_discrete_sequence=REGION_COLORS,
        hole=0.4,
    )
    fig.update_traces(textposition="inside", textinfo="label+percent")
    return _apply_dark_layout(fig, "Regional Revenue Distribution")


# ── Product Charts ──────────────────────────────────────────────────────────

def category_revenue_heatmap(df: pd.DataFrame) -> go.Figure:
    """Heatmap: Category × Month revenue."""
    pivot = df.pivot_table(
        values="net_revenue",
        index="product_category",
        columns="year_month",
        aggfunc="sum",
        fill_value=0,
    )

    # Limit to last 12 months for readability
    if pivot.shape[1] > 12:
        pivot = pivot.iloc[:, -12:]

    fig = px.imshow(
        pivot,
        labels=dict(x="Month", y="Category", color="Revenue (₹)"),
        color_continuous_scale="Inferno",
        aspect="auto",
    )
    return _apply_dark_layout(fig, "Revenue Heatmap: Category × Month")


def top_skus_chart(top_df: pd.DataFrame, title: str = "Top 10 SKUs by Revenue") -> go.Figure:
    """Bar chart of top/bottom SKUs."""
    fig = px.bar(
        top_df,
        x="revenue",
        y="product_sku",
        orientation="h",
        color="revenue",
        color_continuous_scale="Tealgrn",
        labels={"revenue": "Revenue (₹)"},
    )
    fig.update_layout(showlegend=False, yaxis=dict(autorange="reversed"))
    return _apply_dark_layout(fig, title)


# ── Trend Charts ────────────────────────────────────────────────────────────

def moving_average_chart(df: pd.DataFrame, group_col: str = None) -> go.Figure:
    """
    Daily revenue with 30-day and 90-day moving averages.
    Optionally grouped by region or category.
    """
    if group_col and group_col in df.columns:
        daily = (
            df.groupby(["date", group_col])["net_revenue"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
        fig = go.Figure()
        for group_name in daily[group_col].unique():
            group_data = daily[daily[group_col] == group_name]
            fig.add_trace(go.Scatter(
                x=group_data["date"],
                y=group_data["net_revenue"].rolling(config.ROLLING_WINDOW_SHORT, min_periods=7).mean(),
                name=f"{group_name} (30d MA)",
                mode="lines",
            ))
    else:
        daily = (
            df.groupby("date")["net_revenue"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=daily["date"], y=daily["net_revenue"],
            name="Daily Revenue", mode="lines",
            line=dict(color=COLORS["neutral"], width=0.5), opacity=0.4,
        ))
        fig.add_trace(go.Scatter(
            x=daily["date"],
            y=daily["net_revenue"].rolling(config.ROLLING_WINDOW_SHORT, min_periods=7).mean(),
            name="30-day MA", mode="lines",
            line=dict(color=COLORS["primary"], width=2),
        ))
        fig.add_trace(go.Scatter(
            x=daily["date"],
            y=daily["net_revenue"].rolling(config.ROLLING_WINDOW_LONG, min_periods=30).mean(),
            name="90-day MA", mode="lines",
            line=dict(color=COLORS["warning"], width=2),
        ))

    return _apply_dark_layout(fig, "Revenue Trend with Moving Averages")


# ── Anomaly Chart ───────────────────────────────────────────────────────────

def anomaly_chart(anomaly_df: pd.DataFrame) -> go.Figure:
    """Scatter plot highlighting anomalous days."""
    fig = go.Figure()

    normal = anomaly_df[~anomaly_df["is_anomaly"]]
    anomalous = anomaly_df[anomaly_df["is_anomaly"]]

    fig.add_trace(go.Scatter(
        x=normal["date"], y=normal["daily_revenue"],
        mode="markers", name="Normal",
        marker=dict(color=COLORS["primary"], size=4, opacity=0.5),
    ))
    fig.add_trace(go.Scatter(
        x=anomalous["date"], y=anomalous["daily_revenue"],
        mode="markers", name="Anomaly",
        marker=dict(color=COLORS["danger"], size=8, symbol="x"),
    ))
    fig.add_trace(go.Scatter(
        x=anomaly_df["date"], y=anomaly_df["rolling_mean"],
        mode="lines", name="30-day Rolling Mean",
        line=dict(color=COLORS["success"], width=2),
    ))

    return _apply_dark_layout(fig, "Revenue Anomaly Detection")


# ── Forecast Chart ──────────────────────────────────────────────────────────

def forecast_chart(
    historical_df: pd.DataFrame,
    forecast_df: pd.DataFrame,
    validation_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Plot historical revenue, forecast line, and confidence intervals.
    Optionally overlay validation actuals.
    """
    fig = go.Figure()

    # Historical
    fig.add_trace(go.Scatter(
        x=historical_df["ds"], y=historical_df["y"],
        mode="lines", name="Historical",
        line=dict(color=COLORS["primary"], width=2),
    ))

    # Forecast
    fig.add_trace(go.Scatter(
        x=forecast_df["ds"], y=forecast_df["yhat"],
        mode="lines", name="Forecast",
        line=dict(color=COLORS["warning"], width=2, dash="dash"),
    ))

    # Confidence intervals
    fig.add_trace(go.Scatter(
        x=forecast_df["ds"], y=forecast_df["yhat_upper"],
        mode="lines", name="Upper 95%",
        line=dict(width=0), showlegend=False,
    ))
    fig.add_trace(go.Scatter(
        x=forecast_df["ds"], y=forecast_df["yhat_lower"],
        mode="lines", name="Lower 95%",
        line=dict(width=0), showlegend=False,
        fill="tonexty",
        fillcolor="rgba(245, 158, 11, 0.15)",
    ))

    # Validation actuals
    if validation_df is not None and not validation_df.empty:
        fig.add_trace(go.Scatter(
            x=validation_df["ds"], y=validation_df["y"],
            mode="markers+lines", name="Actual (Validation)",
            line=dict(color=COLORS["success"], width=2),
            marker=dict(size=6),
        ))

    return _apply_dark_layout(fig, "Sales Revenue Forecast")


# ── Channel Mix Chart ──────────────────────────────────────────────────────

def channel_mix_chart(channel_df: pd.DataFrame) -> go.Figure:
    """Donut chart of online vs offline split."""
    fig = px.pie(
        channel_df,
        values="revenue",
        names="channel",
        color_discrete_sequence=[COLORS["primary"], COLORS["secondary"]],
        hole=0.5,
    )
    fig.update_traces(textposition="inside", textinfo="label+percent+value")
    return _apply_dark_layout(fig, "Channel Mix")


# ── Contribution Margin Chart ──────────────────────────────────────────────

def contribution_margin_chart(margin_df: pd.DataFrame) -> go.Figure:
    """Bar chart of contribution margin by category."""
    fig = px.bar(
        margin_df.sort_values("margin"),
        x="margin",
        y="product_category",
        orientation="h",
        color="margin_pct",
        color_continuous_scale="RdYlGn",
        labels={"margin": "Margin (₹)", "margin_pct": "Margin %"},
    )
    return _apply_dark_layout(fig, "Contribution Margin by Category")


def return_rate_chart(return_df: pd.DataFrame) -> go.Figure:
    """Bar chart of return rates by category."""
    fig = px.bar(
        return_df.sort_values("return_rate"),
        x="return_rate",
        y="product_category",
        orientation="h",
        color="return_rate",
        color_continuous_scale="Reds",
        labels={"return_rate": "Return Rate"},
    )
    fig.update_layout(xaxis_tickformat=".1%")
    return _apply_dark_layout(fig, "Return Rate by Category")


def festive_uplift_chart(uplift_df: pd.DataFrame) -> go.Figure:
    """Bar chart of festive season revenue uplift."""
    fig = px.bar(
        uplift_df.sort_values("uplift_pct", ascending=False),
        x="festival",
        y="uplift_pct",
        color="uplift_pct",
        color_continuous_scale="Sunset",
        labels={"uplift_pct": "Uplift %"},
    )
    return _apply_dark_layout(fig, "Festive Season Revenue Uplift")
