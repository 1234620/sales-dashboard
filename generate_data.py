"""
Synthetic FMCG Distribution Sales Data Generator
=================================================

Generates ~82,000 realistic B2B distribution transaction records for the
Sales Performance & Forecasting Dashboard.

Business context: Mid-size FMCG distribution company in India importing
and distributing Pran (Bangladesh), Kopiko/Choki Choki/Malkist (Mayora/Inbisco,
Indonesia), and Shan Foods (Pakistan) products.

Features:
- 5 FMCG product categories with ~90 real SKUs from stock reports
- 6 Indian regions with weighted distribution (West/North heavy)
- Festive season demand spikes (Diwali, Holi, Eid, Ramadan, etc.)
- ~45% repeat customer rate (retailers reorder frequently)
- ~3% return rate (FMCG has low returns)
- Offline/online channel split (72/28)
- Pareto (80/20) SKU popularity distribution
- Carton-based quantities (B2B distribution)
- Gradual upward revenue trend (simulating business growth)

Usage:
    python generate_data.py
"""

import pandas as pd
import numpy as np
from faker import Faker
from pathlib import Path
import sys
import os

# Add project root to path so we can import config
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config

fake = Faker("en_IN")
Faker.seed(42)
np.random.seed(42)


# ── Real Product SKUs (extracted from stock report images) ──────────────────

SKU_CATALOG = {
    "Beverages": {
        "skus": [
            # From FG Stock Report — Pran brand beverages
            {"name": "LITCHI-DRINK-150ML-72PCS",     "price_range": (380, 520),   "popularity": 0.14},
            {"name": "LITCHI-DRINK-250ML-48PCS",     "price_range": (480, 650),   "popularity": 0.09},
            {"name": "DRINKO-250ML-LITCHI-COCONUT",  "price_range": (350, 480),   "popularity": 0.07},
            {"name": "DRINKO-250ML-MANGO-COCONUT",   "price_range": (340, 470),   "popularity": 0.05},
            {"name": "FROOTO-MANGO-250ML-48PCS",     "price_range": (420, 560),   "popularity": 0.06},
            {"name": "PRAN-FAZLEE-MANGO-500ML-24PCS","price_range": (580, 780),   "popularity": 0.05},
            {"name": "FROOTO-MANGO-500ML-24PCS",     "price_range": (520, 700),   "popularity": 0.04},
            {"name": "PRAN-MANGO-FRUIT-500ML-24PCS", "price_range": (620, 850),   "popularity": 0.08},
            {"name": "ICE-POP-ASSORTED-50ML-28X12",  "price_range": (280, 400),   "popularity": 0.07},
            {"name": "DOUBLE-DOZER-CAN-250ML-24PCS", "price_range": (720, 950),   "popularity": 0.02},
            {"name": "PRAN-MANGO-BASIL-250ML-24PCS", "price_range": (380, 520),   "popularity": 0.03},
            {"name": "PRAN-ORANGE-BASIL-250ML-24PCS","price_range": (380, 520),   "popularity": 0.02},
            {"name": "DRINKO-330ML-MANGO-COCONUT",   "price_range": (450, 600),   "popularity": 0.04},
            {"name": "DRINKO-330ML-PINEAPPLE",       "price_range": (440, 590),   "popularity": 0.03},
            {"name": "DRINKO-330ML-STRAWBERRY",      "price_range": (440, 590),   "popularity": 0.03},
        ],
    },
    "Bakery & Biscuits": {
        "skus": [
            # From FG Stock Report — Potata biscuits + Malkist crackers
            {"name": "POTATA-BISCUIT-75GM-48PCS",    "price_range": (420, 580),   "popularity": 0.12},
            {"name": "POTATA-CREAM-ONION-75GM-48PCS","price_range": (430, 590),   "popularity": 0.10},
            {"name": "POTATA-BBQ-75GM-48PCS",        "price_range": (420, 580),   "popularity": 0.05},
            {"name": "POTATA-CHEESE-75GM-48PCS",     "price_range": (430, 590),   "popularity": 0.06},
            {"name": "POTATA-BISCUIT-25GM-96PCS",    "price_range": (350, 480),   "popularity": 0.09},
            {"name": "POTATA-BISCUIT-12.5GM-144PCS", "price_range": (300, 420),   "popularity": 0.08},
            {"name": "POTATA-BBQ-25GM-96PCS",        "price_range": (350, 480),   "popularity": 0.03},
            {"name": "POTATA-CHEESE-25GM-96PCS",     "price_range": (350, 480),   "popularity": 0.03},
            {"name": "FAMILY-TOAST-200GM-28PCS",     "price_range": (480, 650),   "popularity": 0.04},
            {"name": "GARLIC-TOAST-200GM-28PCS",     "price_range": (520, 700),   "popularity": 0.05},
            {"name": "MALKIST-CHEESE-45RS-48PCS",    "price_range": (800, 1100),  "popularity": 0.07},
            {"name": "MALKIST-CHOCOLATE-45RS-48PCS", "price_range": (800, 1100),  "popularity": 0.04},
            {"name": "MALKIST-CHEESE-25MRP-48PCS",   "price_range": (520, 700),   "popularity": 0.04},
            {"name": "MALKIST-CHOCOLATE-25MRP-48PCS","price_range": (520, 700),   "popularity": 0.03},
            {"name": "MALKIST-CAPPUCCINO-45RS-48PCS","price_range": (800, 1100),  "popularity": 0.02},
            {"name": "MALKIST-AMERICAN-STYLE-48PCS", "price_range": (750, 1000),  "popularity": 0.04},
            {"name": "FIT-CRACKERS-120GM-48PCS",     "price_range": (580, 780),   "popularity": 0.03},
            {"name": "POTATA-SPICY-100GM-48PCS",     "price_range": (450, 620),   "popularity": 0.03},
            {"name": "PRAN-DRY-CAKE-100GM-24PCS",    "price_range": (380, 520),   "popularity": 0.03},
        ],
    },
    "Confectionery": {
        "skus": [
            # From Order Sheet — Kopiko, Choki Choki, Jam O Jam
            {"name": "KOPIKO-100PCS-BAG",            "price_range": (180, 280),   "popularity": 0.05},
            {"name": "KOPIKO-BUCKET",                "price_range": (650, 900),   "popularity": 0.04},
            {"name": "KOPIKO-JAR-12PCS",             "price_range": (1200, 1600), "popularity": 0.03},
            {"name": "KOPIKO-PKT-47MRP",             "price_range": (380, 520),   "popularity": 0.08},
            {"name": "CHOKI-CHOKI-XL",               "price_range": (250, 380),   "popularity": 0.05},
            {"name": "CHOKI-CHOKI-XL-6PCS",          "price_range": (320, 450),   "popularity": 0.04},
            {"name": "CHOKI-CHOKI-STANDARD",         "price_range": (180, 280),   "popularity": 0.03},
            {"name": "CHOKI-ROLLZ-JAR",              "price_range": (550, 750),   "popularity": 0.04},
            {"name": "CHOKI-STIX",                   "price_range": (220, 340),   "popularity": 0.03},
            {"name": "CHOKI-STIX-6PCS",              "price_range": (280, 400),   "popularity": 0.03},
            {"name": "JAM-O-JAM-STRAWBERRY",         "price_range": (200, 320),   "popularity": 0.03},
            {"name": "JAM-O-JAM-BLUEBERRY",          "price_range": (200, 320),   "popularity": 0.03},
            {"name": "JAM-O-JAM-SMALL",              "price_range": (150, 250),   "popularity": 0.02},
            # From FG Stock Report — Confectionery section
            {"name": "CHOCO-BEAN-PETJAR-DOGGY-20X6", "price_range": (750, 1050),  "popularity": 0.06},
            {"name": "CHOCO-BEAN-PETJAR-FEDER-20X6", "price_range": (750, 1050),  "popularity": 0.04},
            {"name": "CHOCOBEAN-TOFFEE-20GM",        "price_range": (180, 280),   "popularity": 0.02},
            {"name": "CHOCOBEAN-TUBE-35GM-10X12",    "price_range": (320, 450),   "popularity": 0.03},
            {"name": "MAGIC-CUP-100PCS-9JARBOX",     "price_range": (480, 680),   "popularity": 0.05},
            {"name": "LOLLIPOP-8GM-ASSORTED-6JAR",   "price_range": (350, 500),   "popularity": 0.03},
            {"name": "MILK-KULFI-4GM-12JAR",         "price_range": (420, 580),   "popularity": 0.02},
            {"name": "MR-TOM-CANDY-4GM-12JAR",       "price_range": (380, 540),   "popularity": 0.02},
            {"name": "MILK-KANDEEZ-3.5GM-6JAR",      "price_range": (350, 500),   "popularity": 0.02},
            {"name": "PUDDING-35GM-ASSORTED-9JAR",   "price_range": (580, 800),   "popularity": 0.05},
            {"name": "PUDDING-35GM-MANGO-9JAR",      "price_range": (580, 800),   "popularity": 0.06},
            {"name": "PLUS-PLUS-MANGO-MASALA-12JAR", "price_range": (450, 630),   "popularity": 0.02},
            {"name": "PRAN-MILK-WAFER-ROLL-40X12",   "price_range": (320, 460),   "popularity": 0.01},
            {"name": "PRAN-CHOCO-WAFER-ROLL-40X12",  "price_range": (340, 480),   "popularity": 0.01},
            {"name": "WONDER-KID-20GM-6JAR-12PCS",   "price_range": (280, 400),   "popularity": 0.02},
            {"name": "GREEN-MANGO-CANDY-4GM-12JAR",  "price_range": (320, 460),   "popularity": 0.01},
        ],
    },
    "Culinary": {
        "skus": [
            # From FG Stock Report — Culinary section
            {"name": "MR-NOODLES-60GM-KOREAN-SPICY-48PCS", "price_range": (580, 800),  "popularity": 0.40},
            {"name": "CUP-NOODLES-40GM-CHICKEN-48PCS",     "price_range": (650, 880),  "popularity": 0.18},
            {"name": "MR-NOODLES-50GM-CHICKEN-MASALA-60PCS","price_range": (520, 720),  "popularity": 0.15},
            {"name": "CUP-NOODLES-40GM-CURRY-48PCS",       "price_range": (650, 880),  "popularity": 0.15},
            {"name": "MR-NOODLES-60GM-SUPER-SPICY-48PCS",  "price_range": (580, 800),  "popularity": 0.12},
        ],
    },
    "Spice Mixes": {
        "skus": [
            # From Parasnath Warehouse Shan Stocks
            {"name": "SHAN-BIRYANI",                 "price_range": (1600, 2200), "popularity": 0.08},
            {"name": "SHAN-SPECIAL-BOMBAY-BIRYANI",  "price_range": (1600, 2200), "popularity": 0.15},
            {"name": "SHAN-PUNJABI-YAKHNI-PILAU",    "price_range": (1600, 2200), "popularity": 0.10},
            {"name": "SHAN-SHAMI-KABAB",             "price_range": (1600, 2200), "popularity": 0.10},
            {"name": "SHAN-SEEKH-KABAB",             "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-CHICKEN-TIKKA",           "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-TANDOORI-MASALA",         "price_range": (1600, 2200), "popularity": 0.08},
            {"name": "SHAN-TIKKA-BOTI",              "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-NIHARI",                  "price_range": (1800, 2400), "popularity": 0.07},
            {"name": "SHAN-ACHAR-GOSHT",             "price_range": (1600, 2200), "popularity": 0.04},
            {"name": "SHAN-CHICKEN-MASALA",          "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-KORMA",                   "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-FRIED-FISH",              "price_range": (1600, 2200), "popularity": 0.01},
            {"name": "SHAN-KARAHI-GOSHT",            "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-MALAY-CHICKEN-BIRYANI",   "price_range": (1600, 2200), "popularity": 0.01},
            {"name": "SHAN-SINDHI-BIRYANI",          "price_range": (1600, 2200), "popularity": 0.03},
            {"name": "SHAN-BUTTER-CHICKEN",          "price_range": (1600, 2200), "popularity": 0.02},
            {"name": "SHAN-HALEEM-MASALA",           "price_range": (1600, 2200), "popularity": 0.01},
            {"name": "SHAN-CHANA-MASALA",            "price_range": (1500, 2000), "popularity": 0.01},
            {"name": "SHAN-MEAT-MASALA",             "price_range": (1600, 2200), "popularity": 0.02},
            {"name": "SHAN-PAYA-MASALA",             "price_range": (1600, 2200), "popularity": 0.01},
            {"name": "SHAN-CHAAT-MASALA",            "price_range": (1500, 2000), "popularity": 0.02},
            {"name": "SHAN-GARAM-MASALA-115",        "price_range": (1800, 2500), "popularity": 0.03},
            {"name": "SHAN-PULAU-BIRYANI",           "price_range": (1600, 2200), "popularity": 0.03},
        ],
    },
}


def generate_dates() -> pd.DatetimeIndex:
    """Generate daily date range from config."""
    return pd.date_range(start=config.DATE_START, end=config.DATE_END, freq="D")


def get_daily_transaction_count(date: pd.Timestamp) -> int:
    """
    Determine how many transactions happen on a given date.
    Accounts for weekday vs weekend, festive seasons, and growth trend.
    """
    # Base: ~65 transactions/day
    base = 65

    # Weekend boost (Sat/Sun: 15% more)
    if date.dayofweek >= 5:
        base = int(base * 1.15)

    # Gradual growth: ~0.4% per month from start (FMCG steady growth)
    months_elapsed = (date.year - 2023) * 12 + date.month
    growth_factor = 1 + (months_elapsed * 0.004)
    base = int(base * growth_factor)

    # Festive season multipliers
    for festival, window in config.FESTIVE_WINDOWS.items():
        if (date.month == window["month"]
            and window["day_start"] <= date.day <= window["day_end"]):
            base = int(base * window["multiplier"])
            break

    # Summer boost for beverages (handled at transaction level via category weight)
    # Beverages sell more in summer (May–July), reflected in higher overall volume
    if date.month in [5, 6, 7]:
        base = int(base * 1.08)

    # Add some daily randomness (±18%)
    base = int(base * np.random.uniform(0.82, 1.18))

    return max(base, 10)


def _get_sku_for_category(category: str) -> tuple:
    """
    Select a SKU from the catalog using Pareto-weighted popularity.

    Returns:
        (sku_name, price) tuple
    """
    cat_data = SKU_CATALOG[category]
    skus = cat_data["skus"]

    # Extract names and popularity weights
    names = [s["name"] for s in skus]
    weights = np.array([s["popularity"] for s in skus])
    weights = weights / weights.sum()  # Normalize

    # Select SKU
    idx = np.random.choice(len(names), p=weights)
    selected = skus[idx]

    # Price within the SKU's specific range
    price = round(np.random.uniform(*selected["price_range"]), 2)

    return selected["name"], price


def generate_transactions(dates: pd.DatetimeIndex) -> pd.DataFrame:
    """Generate all transactions across all dates."""
    records = []
    txn_counter = 1

    # Pre-generate customer pool (retailers / shops)
    # FMCG distributors serve ~2,000–5,000 retail outlets
    n_customers = 4_500
    customer_ids = [f"RET-{i:05d}" for i in range(1, n_customers + 1)]

    # Create repeat customer pool (~45% of customers are regulars)
    n_repeat = int(n_customers * config.REPEAT_CUSTOMER_RATE)
    repeat_pool = customer_ids[:n_repeat]

    # Category weights for random selection
    cat_names = list(config.CATEGORIES.keys())
    cat_weights = [config.CATEGORIES[c]["weight"] for c in cat_names]

    # Region weights
    region_names = list(config.REGIONS.keys())
    region_weights = [config.REGIONS[r]["weight"] for r in region_names]

    # Channel weights
    channel_names = list(config.CHANNELS.keys())
    channel_weights = list(config.CHANNELS.values())

    customer_idx = n_repeat  # Start assigning new customers from after repeat pool

    print(f"Generating FMCG distribution transactions from {config.DATE_START} to {config.DATE_END}...")

    for date in dates:
        n_txns = get_daily_transaction_count(date)

        for _ in range(n_txns):
            # Pick category (with seasonal adjustment for beverages in summer)
            adjusted_weights = list(cat_weights)
            if date.month in [5, 6, 7]:
                # Summer: boost beverages, slight dip in spice mixes
                bev_idx = cat_names.index("Beverages")
                spice_idx = cat_names.index("Spice Mixes")
                adjusted_weights[bev_idx] *= 1.3
                adjusted_weights[spice_idx] *= 0.7

            elif date.month in [3, 4]:
                # Ramadan/Eid season: boost spice mixes & culinary
                spice_idx = cat_names.index("Spice Mixes")
                cul_idx = cat_names.index("Culinary")
                adjusted_weights[spice_idx] *= 1.6
                adjusted_weights[cul_idx] *= 1.3

            # Normalize weights
            total_w = sum(adjusted_weights)
            adjusted_weights = [w / total_w for w in adjusted_weights]

            category = np.random.choice(cat_names, p=adjusted_weights)

            # Get SKU and price from catalog
            product_sku, unit_price = _get_sku_for_category(category)

            # Quantity: cartons per order (FMCG B2B)
            # Most orders are 1-10 cartons, some bulk orders 10-50
            if np.random.random() < 0.15:
                # Bulk order
                quantity = np.random.randint(10, 51)
            else:
                # Standard order
                quantity = np.random.choice(
                    [1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8],
                    p=[0.10, 0.10, 0.15, 0.15, 0.12, 0.12, 0.08, 0.06, 0.04, 0.04, 0.02, 0.02]
                )

            # Discount (trade discount: 0-18%, weighted toward lower discounts)
            discount_pct = round(np.random.beta(1.2, 6) * config.DISCOUNT_RANGE[1], 4)

            # Net revenue
            net_revenue = round(unit_price * quantity * (1 - discount_pct), 2)

            # Customer (repeat vs new)
            if np.random.random() < config.REPEAT_CUSTOMER_RATE and repeat_pool:
                customer_id = np.random.choice(repeat_pool)
            else:
                customer_id = customer_ids[min(customer_idx, len(customer_ids) - 1)]
                customer_idx = (customer_idx + 1) % len(customer_ids)

            # Region and state
            region = np.random.choice(region_names, p=region_weights)
            state = np.random.choice(config.REGIONS[region]["states"])

            # Channel
            channel = np.random.choice(channel_names, p=channel_weights)

            # Return flag (FMCG has very low return rate)
            return_flag = np.random.random() < config.RETURN_RATE

            records.append({
                "transaction_id": f"TXN-{txn_counter:07d}",
                "date": date.strftime("%Y-%m-%d"),
                "product_sku": product_sku,
                "product_category": category,
                "quantity": quantity,
                "unit_price": unit_price,
                "discount_pct": discount_pct,
                "net_revenue": net_revenue,
                "customer_id": customer_id,
                "region": region,
                "state": state,
                "channel": channel,
                "return_flag": return_flag,
            })
            txn_counter += 1

    return pd.DataFrame(records)


def main():
    """Generate and save synthetic FMCG distribution dataset."""
    print("=" * 60)
    print("FMCG Distribution Dashboard — Synthetic Data Generator")
    print("Brands: Pran | Kopiko | Choki Choki | Malkist | Shan Foods")
    print("=" * 60)

    dates = generate_dates()
    print(f"Date range: {dates[0].date()} to {dates[-1].date()} ({len(dates)} days)")

    df = generate_transactions(dates)

    print(f"\nGenerated {len(df):,} transactions")
    print(f"Unique retail customers: {df['customer_id'].nunique():,}")
    print(f"Unique SKUs: {df['product_sku'].nunique():,}")
    print(f"Revenue range: ₹{df['net_revenue'].min():,.2f} — ₹{df['net_revenue'].max():,.2f}")
    print(f"Total revenue: ₹{df['net_revenue'].sum():,.2f}")

    # Category breakdown
    print("\nCategory distribution:")
    cat_counts = df["product_category"].value_counts()
    for cat, count in cat_counts.items():
        cat_rev = df[df["product_category"] == cat]["net_revenue"].sum()
        print(f"  {cat:20s}: {count:6,d} txns ({count/len(df)*100:.1f}%) | ₹{cat_rev:,.0f}")

    # Region breakdown
    print("\nRegion distribution:")
    reg_counts = df["region"].value_counts()
    for reg, count in reg_counts.items():
        print(f"  {reg:20s}: {count:6,d} ({count/len(df)*100:.1f}%)")

    # Channel breakdown
    print("\nChannel split:")
    ch_counts = df["channel"].value_counts(normalize=True)
    for ch, pct in ch_counts.items():
        print(f"  {ch:20s}: {pct:.1%}")

    # Top 10 SKUs
    print("\nTop 10 SKUs by revenue:")
    sku_rev = df.groupby("product_sku")["net_revenue"].sum().sort_values(ascending=False)
    for sku, rev in sku_rev.head(10).items():
        print(f"  {sku:45s}: ₹{rev:,.0f}")

    # Business metrics
    print(f"\nAvg Order Value: ₹{df['net_revenue'].mean():,.0f}")
    print(f"Return rate: {df['return_flag'].mean():.2%}")
    print(f"Avg discount: {df['discount_pct'].mean():.2%}")

    # Save
    config.SYNTHETIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(config.SYNTHETIC_DATA_PATH, index=False)
    print(f"\n✅ Saved to {config.SYNTHETIC_DATA_PATH}")
    print(f"   File size: {config.SYNTHETIC_DATA_PATH.stat().st_size / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
