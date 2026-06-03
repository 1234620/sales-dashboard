"""
Sales Performance & Forecasting Dashboard
==========================================

Main Streamlit application entry point. Renders all 7 dashboard modules
with sidebar filters and cached data loading.

Run with:
    streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np

import config
from src.data import load_data, filter_data
from src import kpis
from src import viz

# ── Page Config ─────────────────────────────────────────────────────────────

st.set_page_config(
    page_title=config.PAGE_TITLE,
    page_icon=config.PAGE_ICON,
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ──────────────────────────────────────────────────────────────

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* Dark theme overrides */
    .stApp {
        background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
    }

    /* KPI metric cards */
    [data-testid="stMetric"] {
        background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
        border: 1px solid rgba(99,102,241,0.2);
        border-radius: 12px;
        padding: 16px;
        backdrop-filter: blur(10px);
    }

    [data-testid="stMetric"] label {
        color: #A5B4FC !important;
        font-weight: 500;
    }

    [data-testid="stMetric"] [data-testid="stMetricValue"] {
        color: #E5E7EB !important;
        font-weight: 700;
    }

    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
    }

    .stTabs [data-baseweb="tab"] {
        border-radius: 8px;
        padding: 8px 16px;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1A1A2E 0%, #0F0F23 100%);
        border-right: 1px solid rgba(99,102,241,0.15);
    }

    /* Headers */
    h1, h2, h3 {
        color: #E5E7EB !important;
    }

    /* Divider */
    hr {
        border-color: rgba(99,102,241,0.2);
    }
</style>
""", unsafe_allow_html=True)

# ── Data Loading (Cached) ──────────────────────────────────────────────────

@st.cache_data(ttl=600, show_spinner="Loading sales data...")
def get_data():
    """Load and cache the sales dataset."""
    return load_data()

try:
    df = get_data()
except FileNotFoundError as e:
    st.error(f"❌ {e}")
    st.info("Run `python generate_data.py` to create synthetic data first.")
    st.stop()

# ── Sidebar Filters ─────────────────────────────────────────────────────────

st.sidebar.title(f"📊 {config.SIDEBAR_TITLE}")
st.sidebar.markdown("---")

# Date range
min_date = df["date"].min().date()
max_date = df["date"].max().date()
date_range = st.sidebar.date_input(
    "📅 Date Range",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date,
)

# Region filter
all_regions = sorted(df["region"].unique())
selected_regions = st.sidebar.multiselect(
    "🗺️ Regions",
    options=all_regions,
    default=all_regions,
)

# Category filter
all_categories = sorted(df["product_category"].unique())
selected_categories = st.sidebar.multiselect(
    "📦 Categories",
    options=all_categories,
    default=all_categories,
)

# Channel filter
all_channels = sorted(df["channel"].unique())
selected_channels = st.sidebar.multiselect(
    "📡 Channels",
    options=all_channels,
    default=all_channels,
)

# Apply filters
filtered_df = filter_data(
    df,
    date_range=date_range if len(date_range) == 2 else None,
    regions=selected_regions,
    categories=selected_categories,
    channels=selected_channels,
)

# Show filter summary
st.sidebar.markdown("---")
st.sidebar.metric("Transactions", f"{len(filtered_df):,}")
st.sidebar.metric("Date Span", f"{(filtered_df['date'].max() - filtered_df['date'].min()).days} days"
                   if not filtered_df.empty else "N/A")

# ── Main Title ──────────────────────────────────────────────────────────────

st.title(f"{config.PAGE_ICON} {config.PAGE_TITLE}")
st.caption("EComSpace Group — Business Analytics Dashboard")

# ── Tabs ────────────────────────────────────────────────────────────────────

tabs = st.tabs(config.TAB_NAMES)

# ── Tab 1: KPI Overview ────────────────────────────────────────────────────

with tabs[0]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Key Performance Indicators")

        # Compute KPIs
        rev = kpis.total_revenue(filtered_df)
        aov = kpis.average_order_value(filtered_df)
        disc_rate = kpis.discount_impact_rate(filtered_df)
        velocity = kpis.sales_velocity(filtered_df)
        repeat_rate = kpis.repeat_purchase_rate(filtered_df)
        margin = kpis.contribution_margin(filtered_df)

        # MoM data for delta
        mom_df = kpis.mom_growth(filtered_df)
        latest_mom = mom_df["mom_growth_pct"].iloc[-1] if len(mom_df) > 1 else None

        # KPI Cards Row 1
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            card = viz.kpi_card_data("Total Revenue", rev, delta=latest_mom)
            st.metric(card["label"], card["value_str"], card["delta_str"])
        with col2:
            card = viz.kpi_card_data("Contribution Margin", margin)
            st.metric(card["label"], card["value_str"])
        with col3:
            card = viz.kpi_card_data("Average Order Value", aov)
            st.metric(card["label"], card["value_str"])
        with col4:
            st.metric("Sales Velocity", f"₹{velocity:,.0f}/day")

        # KPI Cards Row 2
        col5, col6, col7, col8 = st.columns(4)
        with col5:
            st.metric("Discount Impact", f"{disc_rate:.1%}")
        with col6:
            st.metric("Repeat Purchase Rate", f"{repeat_rate:.1f}%")
        with col7:
            st.metric("Total Transactions", f"{len(filtered_df):,}")
        with col8:
            st.metric("Unique Customers", f"{filtered_df['customer_id'].nunique():,}")

        # Revenue trend chart
        st.markdown("---")
        st.plotly_chart(viz.revenue_trend_chart(mom_df), use_container_width=True)

# ── Tab 2: Regional Analysis ───────────────────────────────────────────────

with tabs[1]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Regional Performance")

        regional_df = kpis.regional_revenue_share(filtered_df)

        col1, col2 = st.columns(2)
        with col1:
            st.plotly_chart(viz.regional_revenue_chart(regional_df), use_container_width=True)
        with col2:
            st.plotly_chart(viz.regional_map_chart(regional_df), use_container_width=True)

        # Regional details table
        st.markdown("---")
        st.subheader("Regional Breakdown")
        display_df = regional_df.copy()
        display_df["revenue"] = display_df["revenue"].apply(lambda x: f"₹{x:,.0f}")
        display_df["share_pct"] = display_df["share_pct"].apply(lambda x: f"{x:.1f}%")
        st.dataframe(display_df, use_container_width=True, hide_index=True)

# ── Tab 3: Product Performance ──────────────────────────────────────────────

with tabs[2]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Product Performance")

        # Revenue heatmap
        st.plotly_chart(
            viz.category_revenue_heatmap(filtered_df),
            use_container_width=True,
        )

        # Top/Bottom SKUs
        st.markdown("---")
        top_df, bottom_df = kpis.top_bottom_skus(filtered_df, n=10)

        col1, col2 = st.columns(2)
        with col1:
            st.plotly_chart(
                viz.top_skus_chart(top_df, "🏆 Top 10 SKUs by Revenue"),
                use_container_width=True,
            )
        with col2:
            st.plotly_chart(
                viz.top_skus_chart(bottom_df, "⬇️ Bottom 10 SKUs by Revenue"),
                use_container_width=True,
            )

# ── Tab 4: Trend Analysis ──────────────────────────────────────────────────

with tabs[3]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Trend Analysis")

        trend_group = st.radio(
            "Group by:",
            ["None", "Region", "Category"],
            horizontal=True,
        )

        group_col = None
        if trend_group == "Region":
            group_col = "region"
        elif trend_group == "Category":
            group_col = "product_category"

        st.plotly_chart(
            viz.moving_average_chart(filtered_df, group_col),
            use_container_width=True,
        )

# ── Tab 5: Sales Forecasting ───────────────────────────────────────────────

with tabs[4]:
    st.subheader("Revenue Forecasting")

    try:
        from src.forecast import (
            prepare_prophet_data,
            train_prophet_model,
            make_forecast,
            evaluate_model,
        )

        # Forecast horizon slider
        horizon = st.slider(
            "Forecast Horizon (months)",
            min_value=1,
            max_value=config.FORECAST_MAX_HORIZON,
            value=6,
        )

        # Train/predict (cached)
        @st.cache_resource(show_spinner="Training forecast model...")
        def get_forecast_model(_train_df):
            """Train and cache Prophet model."""
            return train_prophet_model(_train_df)

        train_df, validation_df = prepare_prophet_data(df)  # Use full data, not filtered

        if len(train_df) < 12:
            st.warning("Need at least 12 months of data for reliable forecasting.")
        else:
            model = get_forecast_model(train_df)
            forecast_df = make_forecast(model, periods=horizon)

            # Forecast chart
            st.plotly_chart(
                viz.forecast_chart(train_df, forecast_df, validation_df),
                use_container_width=True,
            )

            # Model evaluation
            if not validation_df.empty:
                eval_result = evaluate_model(model, validation_df)
                col1, col2 = st.columns(2)
                with col1:
                    mape = eval_result["mape"]
                    status_emoji = "✅" if eval_result["status"] == "pass" else "⚠️"
                    st.metric("Forecast Accuracy (MAPE)", f"{mape:.1f}%")
                    st.caption(f"{status_emoji} {'PASS' if eval_result['status'] == 'pass' else 'NEEDS REVIEW'} — Threshold: {config.MAPE_THRESHOLD}%")
                with col2:
                    st.metric("Validation Points", f"{len(validation_df)} months")
                    st.caption(f"Validation: {validation_df['ds'].min().strftime('%b %Y')} → {validation_df['ds'].max().strftime('%b %Y')}")

    except ImportError:
        st.error("Prophet is not installed. Install with: `pip install prophet`")
    except Exception as e:
        st.error(f"Forecasting error: {e}")
        st.info("Try running with the full dataset (remove date filters).")

# ── Tab 6: Anomaly Detection ───────────────────────────────────────────────

with tabs[5]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Revenue Anomaly Detection")

        anomaly_df = kpis.anomaly_scores(filtered_df)
        n_anomalies = anomaly_df["is_anomaly"].sum()

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Days Analyzed", f"{len(anomaly_df):,}")
        with col2:
            st.metric("Anomalies Detected", f"{n_anomalies}")
        with col3:
            st.metric("Z-Score Threshold", f"±{config.ZSCORE_THRESHOLD}")

        st.plotly_chart(viz.anomaly_chart(anomaly_df), use_container_width=True)

        # Show anomaly table
        if n_anomalies > 0:
            st.markdown("---")
            st.subheader("🚨 Anomalous Days")
            anomaly_table = anomaly_df[anomaly_df["is_anomaly"]].copy()
            anomaly_table["date"] = anomaly_table["date"].dt.strftime("%Y-%m-%d")
            anomaly_table["daily_revenue"] = anomaly_table["daily_revenue"].apply(lambda x: f"₹{x:,.0f}")
            anomaly_table["z_score"] = anomaly_table["z_score"].apply(lambda x: f"{x:.2f}")
            st.dataframe(
                anomaly_table[["date", "daily_revenue", "rolling_mean", "z_score"]],
                use_container_width=True,
                hide_index=True,
            )

# ── Tab 7: Contribution Margin ─────────────────────────────────────────────

with tabs[6]:
    if filtered_df.empty:
        st.warning("No data matches the current filters.")
    else:
        st.subheader("Profitability Analysis")

        col1, col2 = st.columns(2)

        with col1:
            margin_df = kpis.category_contribution_margin(filtered_df)
            st.plotly_chart(viz.contribution_margin_chart(margin_df), use_container_width=True)

        with col2:
            return_df = kpis.return_rate_by_category(filtered_df)
            st.plotly_chart(viz.return_rate_chart(return_df), use_container_width=True)

        # Channel mix
        st.markdown("---")
        col3, col4 = st.columns(2)
        with col3:
            channel_df = kpis.channel_mix(filtered_df)
            st.plotly_chart(viz.channel_mix_chart(channel_df), use_container_width=True)

        with col4:
            uplift_df = kpis.festive_season_uplift(filtered_df)
            st.plotly_chart(viz.festive_uplift_chart(uplift_df), use_container_width=True)

# ── Footer ──────────────────────────────────────────────────────────────────

st.markdown("---")
st.caption(
    "Built by **Ahmed Moosani** — MBA Tech (AI), MPSTME NMIMS Mumbai | "
    "Internship Project at EComSpace Group | 2026"
)
