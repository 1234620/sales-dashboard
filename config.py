"""
Centralized configuration for the Sales Performance & Forecasting Dashboard.

All constants, file paths, business parameters, and model hyperparameters
are defined here. No magic numbers in application code.

Business context: Mid-size FMCG distribution company in India distributing
imported brands — Pran (Bangladesh), Kopiko/Choki Choki/Malkist (Mayora/Inbisco,
Indonesia), and Shan Foods (Pakistan).
"""

import os
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SYNTHETIC_DATA_DIR = DATA_DIR / "synthetic"

SYNTHETIC_DATA_PATH = SYNTHETIC_DATA_DIR / "sales_data.csv"
PROCESSED_DATA_PATH = PROCESSED_DATA_DIR / "master_sales.csv"

# ── Dataset Parameters ──────────────────────────────────────────────────────
DATE_START = "2023-01-01"
DATE_END = "2026-04-30"
TARGET_ROWS = 82_000  # Approximate number of synthetic transactions

# ── Product Categories & Price Ranges (INR per carton — B2B distribution) ───
# Weights derived from FG Stock Report: Beverages (19,988), Bakery (20,218),
# Confectionery (9,970), Culinary (2,152), Spice Mixes (2,067 Shan stock)
CATEGORIES = {
    "Beverages":          {"min_price": 120,  "max_price": 1500, "weight": 0.28},
    "Bakery & Biscuits":  {"min_price": 100,  "max_price": 2000, "weight": 0.27},
    "Confectionery":      {"min_price": 80,   "max_price": 3000, "weight": 0.22},
    "Culinary":           {"min_price": 300,  "max_price": 1500, "weight": 0.13},
    "Spice Mixes":        {"min_price": 1400, "max_price": 3200, "weight": 0.10},
}

# ── Indian Regions & States ─────────────────────────────────────────────────
# FMCG distribution skews West/North with presence across India
REGIONS = {
    "West":       {"states": ["Maharashtra", "Gujarat", "Goa", "Rajasthan"], "weight": 0.30},
    "North":      {"states": ["Delhi", "Uttar Pradesh", "Haryana", "Punjab"], "weight": 0.25},
    "South":      {"states": ["Karnataka", "Tamil Nadu", "Kerala", "Telangana", "Andhra Pradesh"], "weight": 0.22},
    "East":       {"states": ["West Bengal", "Odisha", "Bihar", "Jharkhand"], "weight": 0.13},
    "Central":    {"states": ["Madhya Pradesh", "Chhattisgarh"], "weight": 0.06},
    "North-East": {"states": ["Assam", "Meghalaya", "Manipur", "Tripura"], "weight": 0.04},
}

# ── Channels ────────────────────────────────────────────────────────────────
# FMCG distribution is predominantly offline (trade/wholesale/retail)
CHANNELS = {"offline": 0.72, "online": 0.28}

# ── Business Parameters ─────────────────────────────────────────────────────
REPEAT_CUSTOMER_RATE = 0.45       # ~45% — retailers reorder frequently in FMCG
RETURN_RATE = 0.03                # ~3% — FMCG has much lower returns than e-commerce
DISCOUNT_RANGE = (0.0, 0.18)      # Trade discounts are tighter in FMCG (0–18%)
FULFILLMENT_COST_RATE = 0.04      # Lower fulfillment cost for bulk FMCG distribution

# ── Festive Season Windows (for seasonal uplift in synthetic data) ──────────
# Includes both Hindu festivals and Eid/Ramadan (relevant for Shan spice demand)
FESTIVE_WINDOWS = {
    "Diwali":    {"month": 10, "day_start": 15, "day_end": 31, "multiplier": 1.8},
    "Holi":      {"month": 3,  "day_start": 1,  "day_end": 15, "multiplier": 1.3},
    "Navratri":  {"month": 10, "day_start": 1,  "day_end": 14, "multiplier": 1.4},
    "NewYear":   {"month": 1,  "day_start": 1,  "day_end": 15, "multiplier": 1.25},
    "EndOfYear": {"month": 12, "day_start": 20, "day_end": 31, "multiplier": 1.5},
    "Ramadan":   {"month": 3,  "day_start": 15, "day_end": 31, "multiplier": 1.35},
    "Eid":       {"month": 4,  "day_start": 10, "day_end": 20, "multiplier": 1.5},
    "Summer":    {"month": 5,  "day_start": 1,  "day_end": 31, "multiplier": 1.2},
}

# ── Stock Level Reference (from FG Stock Report, 06-06-2026) ────────────────
# Used for normalization context; not directly consumed by the app
STOCK_REFERENCE = {
    "total_cartons": 52_328,
    "inventory_holding_days": 8,       # Industry standard: 7–10 days
    "daily_dispatch_rate": 6_541,      # 52,328 / 8
    "category_stock": {
        "Beverages": 19_988,
        "Bakery & Biscuits": 20_218,
        "Confectionery": 9_970,
        "Culinary": 2_152,
        "Spice Mixes": 2_067,
    },
}

# ── Anomaly Detection ───────────────────────────────────────────────────────
ZSCORE_THRESHOLD = 2.0            # Flag revenue days with |z-score| > 2.0
ROLLING_WINDOW_SHORT = 30         # 30-day rolling window
ROLLING_WINDOW_LONG = 90          # 90-day rolling window

# ── Forecasting ─────────────────────────────────────────────────────────────
FORECAST_TRAIN_END = "2026-01-31"       # Train on data up to this date
FORECAST_VALIDATION_START = "2026-02-01" # Validation period starts here
FORECAST_MAX_HORIZON = 12               # Maximum months to forecast
MAPE_THRESHOLD = 12.0                   # If MAPE > 12%, flag model performance

# ── Indian Holidays for Prophet ─────────────────────────────────────────────
INDIAN_HOLIDAYS = [
    {"holiday": "Republic Day",      "ds": "2024-01-26", "lower_window": -1, "upper_window": 1},
    {"holiday": "Republic Day",      "ds": "2025-01-26", "lower_window": -1, "upper_window": 1},
    {"holiday": "Republic Day",      "ds": "2026-01-26", "lower_window": -1, "upper_window": 1},
    {"holiday": "Holi",              "ds": "2024-03-25", "lower_window": -2, "upper_window": 1},
    {"holiday": "Holi",              "ds": "2025-03-14", "lower_window": -2, "upper_window": 1},
    {"holiday": "Holi",              "ds": "2026-03-04", "lower_window": -2, "upper_window": 1},
    {"holiday": "Independence Day",  "ds": "2024-08-15", "lower_window": -1, "upper_window": 1},
    {"holiday": "Independence Day",  "ds": "2025-08-15", "lower_window": -1, "upper_window": 1},
    {"holiday": "Diwali",            "ds": "2024-11-01", "lower_window": -7, "upper_window": 3},
    {"holiday": "Diwali",            "ds": "2025-10-20", "lower_window": -7, "upper_window": 3},
    {"holiday": "Navratri",          "ds": "2024-10-03", "lower_window": -1, "upper_window": 9},
    {"holiday": "Navratri",          "ds": "2025-10-02", "lower_window": -1, "upper_window": 9},
    {"holiday": "Gandhi Jayanti",    "ds": "2024-10-02", "lower_window": 0,  "upper_window": 0},
    {"holiday": "Gandhi Jayanti",    "ds": "2025-10-02", "lower_window": 0,  "upper_window": 0},
    {"holiday": "Christmas",         "ds": "2024-12-25", "lower_window": -3, "upper_window": 1},
    {"holiday": "Christmas",         "ds": "2025-12-25", "lower_window": -3, "upper_window": 1},
    {"holiday": "Eid ul-Fitr",       "ds": "2024-04-11", "lower_window": -5, "upper_window": 3},
    {"holiday": "Eid ul-Fitr",       "ds": "2025-03-31", "lower_window": -5, "upper_window": 3},
    {"holiday": "Eid ul-Fitr",       "ds": "2026-03-20", "lower_window": -5, "upper_window": 3},
    {"holiday": "Eid ul-Adha",       "ds": "2024-06-17", "lower_window": -3, "upper_window": 2},
    {"holiday": "Eid ul-Adha",       "ds": "2025-06-07", "lower_window": -3, "upper_window": 2},
]

# ── Dashboard Layout ────────────────────────────────────────────────────────
PAGE_TITLE = "Sales Performance & Forecasting Dashboard"
PAGE_ICON = "📊"
SIDEBAR_TITLE = "Filters"

TAB_NAMES = [
    "📈 KPI Overview",
    "🗺️ Regional Analysis",
    "📦 Product Performance",
    "📉 Trend Analysis",
    "🔮 Sales Forecasting",
    "🚨 Anomaly Detection",
    "💰 Contribution Margin",
]
