# 📊 Sales Performance & Forecasting Dashboard

**Status:** 🟡 Initial scaffolding complete — synthetic data generator, KPI engine, and dashboard UI built. Pending: dependency installation, data generation, and deployment.

**Last Updated:** 2026-06-03

---

## What This Is

An end-to-end **Sales Performance & Forecasting Dashboard** for [EComSpace Group](https://ecomspace.com), built as a **Streamlit Python application**. It replaces manual Excel-based sales reporting with an interactive dashboard that:

- Tracks **16 KPIs** across revenue, profitability, and operations
- Visualizes **regional** and **product-level** performance
- **Forecasts revenue** using Facebook Prophet with Indian holiday effects
- **Detects anomalies** via Z-score analysis
- Provides **contribution margin** and profitability views

Built as part of the Technical Internship Program 2026 (MPSTME NMIMS Mumbai × EComSpace Group).

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/1234620/sales-dashboard.git
cd sales-dashboard

# 2. Virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate synthetic data (~82K transactions)
python generate_data.py

# 5. Run the dashboard
streamlit run app.py
# Opens at http://localhost:8501
```

---

## Architecture

```
sales-dashboard/
├── app.py                  # Streamlit entry point — 7 tabbed modules
├── config.py               # All constants, paths, and parameters (no magic numbers)
├── generate_data.py        # Synthetic data generator (~82K transactions)
├── requirements.txt        # Pinned Python dependencies
├── packages.txt            # System deps for Streamlit Cloud deployment
├── .gitignore
│
├── src/
│   ├── __init__.py
│   ├── data.py             # Data loading, validation, and cleaning pipeline
│   ├── kpis.py             # 16 KPI computation functions (pure, testable)
│   ├── viz.py              # Plotly chart builders (dark theme, Indian formatting)
│   └── forecast.py         # Prophet model: train, predict, evaluate (MAPE)
│
├── tests/
│   ├── __init__.py
│   └── test_kpis.py        # Unit tests for KPI functions
│
├── data/
│   ├── raw/                # Real data (gitignored)
│   ├── processed/          # Cleaned master dataset
│   └── synthetic/          # Generated synthetic dataset
│
└── notebooks/              # Jupyter notebooks for EDA (exploration only)
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **All KPIs are pure functions** | No Streamlit calls inside `kpis.py` — makes them unit-testable |
| **`config.py` centralizes everything** | No magic numbers in code. All paths, thresholds, and parameters in one file |
| **`@st.cache_data` / `@st.cache_resource`** | Prophet retraining on every click is unacceptable for 82K rows |
| **Dark theme with glassmorphism CSS** | Business dashboards need to look premium |
| **Indian number formatting** | Lakhs (L) and Crores (Cr) instead of M/B for the Indian market |
| **Prophet with Indian holidays** | Diwali, Holi, Navratri have massive e-commerce impact in India |
| **Fulfillment cost at 5%** | Explicit assumption (documented in config) until real cost data is available |

---

## Dashboard Modules

| Tab | Module | Key Visuals |
|-----|--------|-------------|
| 1 | **KPI Overview** | 8 metric cards + monthly revenue bar/line chart with MoM growth |
| 2 | **Regional Analysis** | Horizontal bar chart + donut chart of 6 Indian regions |
| 3 | **Product Performance** | Category × Month revenue heatmap + top/bottom 10 SKUs |
| 4 | **Trend Analysis** | Daily revenue with 30-day and 90-day moving averages |
| 5 | **Sales Forecasting** | Prophet forecast with 95% confidence intervals + MAPE evaluation |
| 6 | **Anomaly Detection** | Z-score scatter plot + anomalous days table |
| 7 | **Contribution Margin** | Category margin bars + return rates + channel mix + festive uplift |

---

## KPIs (16 Total)

| # | KPI | Source | Notes |
|---|-----|--------|-------|
| 1 | Total Revenue | `kpis.total_revenue()` | SUM(net_revenue) |
| 2 | Contribution Margin | `kpis.contribution_margin()` | Revenue − discounts − returns − fulfillment (5%) |
| 3 | MoM Growth | `kpis.mom_growth()` | % change vs prior month |
| 4 | YoY Growth | `kpis.yoy_growth()` | % change vs same month prior year |
| 5 | Average Order Value | `kpis.average_order_value()` | Revenue / unique transactions |
| 6 | Discount Impact Rate | `kpis.discount_impact_rate()` | (Gross − Net) / Gross |
| 7 | Return Rate by Category | `kpis.return_rate_by_category()` | Returns / units per category |
| 8 | Regional Revenue Share | `kpis.regional_revenue_share()` | Region revenue / total |
| 9 | Category Contribution Margin | `kpis.category_contribution_margin()` | Per-category margin |
| 10 | Sales Velocity | `kpis.sales_velocity()` | Avg daily revenue |
| 11 | Repeat Purchase Rate | `kpis.repeat_purchase_rate()` | Repeat txns / total txns |
| 12 | Top/Bottom SKUs | `kpis.top_bottom_skus()` | Revenue-ranked SKU list |
| 13 | Forecast Accuracy | `forecast.compute_mape()` | MAPE on 3-month holdout |
| 14 | Anomaly Score | `kpis.anomaly_scores()` | Z-score vs 30-day rolling mean |
| 15 | Festive Season Uplift | `kpis.festive_season_uplift()` | Festive vs normal daily avg |
| 16 | Channel Mix | `kpis.channel_mix()` | Online vs offline split |

> **Dropped from original plan:** KPI #17 "Inventory Turnover Proxy" — removed because the dataset has no inventory/stock data. Cannot compute it honestly.

---

## Dataset Schema

| Field | Type | Example |
|-------|------|---------|
| `transaction_id` | string | TXN-0001234 |
| `date` | datetime | 2024-10-15 |
| `product_sku` | string | ELEC-TV-01 |
| `product_category` | category | Electronics |
| `quantity` | integer | 2 |
| `unit_price` | float | 12499.00 |
| `discount_pct` | float | 0.15 |
| `net_revenue` | float | 21248.30 |
| `customer_id` | string | CUST-008823 |
| `region` | category | West |
| `state` | string | Maharashtra |
| `channel` | category | online |
| `return_flag` | boolean | False |

**8 Categories:** Electronics, Fashion, Home & Kitchen, Beauty, Sports, Books, Grocery, Others
**6 Regions:** West, South, North, East, Central, North-East

---

## Forecasting Model

- **Algorithm:** Facebook Prophet
- **Training:** Monthly aggregated revenue, Jan 2023 – Jan 2026
- **Validation:** Feb – Apr 2026 holdout (3 months)
- **Holidays:** Indian national holidays + Diwali, Holi, Navratri (with pre/post windows)
- **Output:** Point forecast + 95% confidence interval
- **Evaluation:** MAPE threshold at 12% — flagged if exceeded
- **Caching:** Model is cached via `@st.cache_resource` to avoid retraining on every interaction

---

## Synthetic Data Generator

`generate_data.py` produces ~82,000 transactions with these realistic patterns:

- **Festive season spikes:** Diwali (1.8x), End-of-Year (1.5x), Navratri (1.4x), Holi (1.3x)
- **Regional weighting:** West 28%, South 25%, North 22%, East 12%, Central 8%, NE 5%
- **Growth trend:** +0.5% per month (simulating organic business growth)
- **Repeat customers:** ~20% of the customer base
- **Returns:** ~8% of orders
- **Discount distribution:** Beta(1.5, 5) — skewed toward lower discounts
- **Price distribution:** Log-uniform within category ranges (realistic long tail)

---

## Running Tests

```bash
python -m pytest tests/ -v
```

Tests cover: total revenue, AOV, discount rate, MoM growth, regional share, repeat purchase rate, return rates, channel mix, and sales velocity.

---

## Deployment (Streamlit Community Cloud)

1. Push to GitHub (done)
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect this repo
4. Set main file: `app.py`
5. `packages.txt` handles system dependencies (build-essential for Prophet/pystan)
6. Deploy

> **⚠️ Prophet installation note:** Prophet requires C++ build tools. The `packages.txt` file includes `build-essential` for this. If deployment fails, check Streamlit Cloud logs for pystan/cmdstanpy errors.

---

## What's Done vs. What's Next

### ✅ Completed
- [x] Project scaffolding and architecture
- [x] Centralized configuration (`config.py`)
- [x] Data ingestion pipeline with validation
- [x] 16 KPI computation functions
- [x] All chart/visualization functions
- [x] Prophet forecasting module
- [x] Synthetic data generator
- [x] Main Streamlit dashboard (7 tabs)
- [x] Unit tests for KPIs
- [x] GitHub repo created and pushed

### 🔲 Next Steps
- [ ] Generate synthetic data and validate
- [ ] Install dependencies and run dashboard locally
- [ ] Add India choropleth map (requires GeoJSON file)
- [ ] Jupyter notebooks for EDA (01_eda.ipynb, 02_kpi_validation.ipynb)
- [ ] Deploy to Streamlit Community Cloud
- [ ] Integrate real EComSpace data (when available)
- [ ] Add data export (CSV/PDF download from dashboard)

---

## For AI/Developer Continuation

If you're picking this up mid-way:

1. **All business logic is in `src/kpis.py`** — pure functions, no Streamlit dependency
2. **All visualization is in `src/viz.py`** — returns Plotly figures, called from `app.py`
3. **`config.py` is the source of truth** for all constants, thresholds, and paths
4. **Prophet model is cached** via `@st.cache_resource` in `app.py`
5. **Data pipeline flow:** CSV → `src/data.py:load_data()` → `filter_data()` → KPIs/Charts
6. **Tests are in `tests/test_kpis.py`** — run with `pytest`
7. **Dropped KPI #17** (Inventory Turnover) — no stock data in schema
8. **Fulfillment cost is 5%** — hardcoded in `config.FULFILLMENT_COST_RATE`, swap when real costs arrive

---

## Author

**Ahmed Moosani**
MBA Tech (Artificial Intelligence) — Semester VII
MPSTME, NMIMS Mumbai
Roll No: R023 | SAP: 70512300046

Internship: EComSpace Group (18 May – 11 July 2026)
Department: Business Analytics / Strategy
