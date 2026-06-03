"""
Centralized configuration for the Sales Performance & Forecasting Dashboard.

All constants, file paths, business parameters, and model hyperparameters
are defined here. No magic numbers in application code.
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

# ── Product Categories & Price Ranges (INR) ─────────────────────────────────
CATEGORIES = {
    "Electronics":      {"min_price": 999,   "max_price": 79999,  "weight": 0.18},
    "Fashion":          {"min_price": 299,   "max_price": 9999,   "weight": 0.20},
    "Home & Kitchen":   {"min_price": 199,   "max_price": 24999,  "weight": 0.15},
    "Beauty":           {"min_price": 99,    "max_price": 4999,   "weight": 0.12},
    "Sports":           {"min_price": 299,   "max_price": 14999,  "weight": 0.08},
    "Books":            {"min_price": 99,    "max_price": 1999,   "weight": 0.10},
    "Grocery":          {"min_price": 49,    "max_price": 2999,   "weight": 0.12},
    "Others":           {"min_price": 99,    "max_price": 9999,   "weight": 0.05},
}

# ── Indian Regions & States ─────────────────────────────────────────────────
REGIONS = {
    "West":       {"states": ["Maharashtra", "Gujarat", "Goa", "Rajasthan"], "weight": 0.28},
    "South":      {"states": ["Karnataka", "Tamil Nadu", "Kerala", "Telangana", "Andhra Pradesh"], "weight": 0.25},
    "North":      {"states": ["Delhi", "Uttar Pradesh", "Haryana", "Punjab"], "weight": 0.22},
    "East":       {"states": ["West Bengal", "Odisha", "Bihar", "Jharkhand"], "weight": 0.12},
    "Central":    {"states": ["Madhya Pradesh", "Chhattisgarh"], "weight": 0.08},
    "North-East": {"states": ["Assam", "Meghalaya", "Manipur", "Tripura"], "weight": 0.05},
}

# ── Channels ────────────────────────────────────────────────────────────────
CHANNELS = {"online": 0.62, "offline": 0.38}

# ── Business Parameters ─────────────────────────────────────────────────────
REPEAT_CUSTOMER_RATE = 0.20       # ~20% of customers are repeat buyers
RETURN_RATE = 0.08                # ~8% of orders get returned
DISCOUNT_RANGE = (0.0, 0.35)     # Discounts range from 0% to 35%
FULFILLMENT_COST_RATE = 0.05     # Estimated fulfillment cost as % of net revenue

# ── Festive Season Windows (for seasonal uplift in synthetic data) ──────────
FESTIVE_WINDOWS = {
    "Diwali":    {"month": 10, "day_start": 15, "day_end": 31, "multiplier": 1.8},
    "Holi":      {"month": 3,  "day_start": 1,  "day_end": 15, "multiplier": 1.3},
    "Navratri":  {"month": 10, "day_start": 1,  "day_end": 14, "multiplier": 1.4},
    "NewYear":   {"month": 1,  "day_start": 1,  "day_end": 15, "multiplier": 1.25},
    "EndOfYear": {"month": 12, "day_start": 20, "day_end": 31, "multiplier": 1.5},
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
