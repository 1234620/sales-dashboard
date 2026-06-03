"""
Synthetic Sales Data Generator
==============================

Generates ~82,000 realistic e-commerce transaction records for the
Sales Performance & Forecasting Dashboard.

Features:
- 8 product categories with realistic price ranges
- 6 Indian regions with weighted distribution
- Festive season demand spikes (Diwali, Holi, Navratri, etc.)
- ~20% repeat customer rate
- ~8% return rate
- Online/offline channel split (62/38)
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

    # Gradual growth: ~0.5% per month from start
    months_elapsed = (date.year - 2023) * 12 + date.month
    growth_factor = 1 + (months_elapsed * 0.005)
    base = int(base * growth_factor)

    # Festive season multipliers
    for festival, window in config.FESTIVE_WINDOWS.items():
        if (date.month == window["month"]
            and window["day_start"] <= date.day <= window["day_end"]):
            base = int(base * window["multiplier"])
            break

    # Add some daily randomness (±20%)
    base = int(base * np.random.uniform(0.8, 1.2))

    return max(base, 10)


def generate_transactions(dates: pd.DatetimeIndex) -> pd.DataFrame:
    """Generate all transactions across all dates."""
    records = []
    txn_counter = 1

    # Pre-generate customer pool
    # Total unique customers ≈ target_rows / avg_txns_per_customer
    n_customers = int(config.TARGET_ROWS / 1.25)  # Avg 1.25 txns per customer
    customer_ids = [f"CUST-{i:06d}" for i in range(1, n_customers + 1)]

    # Create repeat customer pool (~20% of customers)
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

    # SKU templates per category
    sku_templates = {
        "Electronics": ["TV", "PHONE", "LAPTOP", "TABLET", "CAMERA", "SPEAKER", "HEADPHONE"],
        "Fashion": ["SHIRT", "JEANS", "DRESS", "SHOES", "BAG", "WATCH", "JACKET"],
        "Home & Kitchen": ["MIXER", "IRON", "COOKER", "MATTRESS", "LAMP", "TABLE", "SOFA"],
        "Beauty": ["CREAM", "SERUM", "LIPSTICK", "PERFUME", "SHAMPOO", "MASK", "LOTION"],
        "Sports": ["BAT", "BALL", "RACKET", "SHOE", "MAT", "BOTTLE", "BAND"],
        "Books": ["FICTION", "NONFIC", "COMIC", "TEXTBOOK", "GUIDE", "NOVEL", "BIO"],
        "Grocery": ["RICE", "OIL", "SPICE", "FLOUR", "TEA", "SNACK", "DAIRY"],
        "Others": ["GIFT", "TOY", "CRAFT", "TOOL", "GARDEN", "PET", "MISC"],
    }

    customer_idx = n_repeat  # Start assigning new customers from after repeat pool

    print(f"Generating transactions from {config.DATE_START} to {config.DATE_END}...")

    for date in dates:
        n_txns = get_daily_transaction_count(date)

        for _ in range(n_txns):
            # Pick category
            category = np.random.choice(cat_names, p=cat_weights)
            cat_config = config.CATEGORIES[category]

            # Generate SKU
            sku_type = np.random.choice(sku_templates[category])
            sku_variant = np.random.randint(1, 20)
            product_sku = f"{category[:4].upper()}-{sku_type}-{sku_variant:02d}"

            # Quantity (mostly 1, sometimes 2-5)
            quantity = np.random.choice([1, 1, 1, 1, 2, 2, 3, 4, 5])

            # Price (log-uniform within category range for realistic distribution)
            log_min = np.log(cat_config["min_price"])
            log_max = np.log(cat_config["max_price"])
            unit_price = round(np.exp(np.random.uniform(log_min, log_max)), 2)

            # Discount (0-35%, weighted toward lower discounts)
            discount_pct = round(np.random.beta(1.5, 5) * config.DISCOUNT_RANGE[1], 2)

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

            # Return flag
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
    """Generate and save synthetic dataset."""
    print("=" * 60)
    print("Sales Dashboard — Synthetic Data Generator")
    print("=" * 60)

    dates = generate_dates()
    print(f"Date range: {dates[0].date()} to {dates[-1].date()} ({len(dates)} days)")

    df = generate_transactions(dates)

    print(f"\nGenerated {len(df):,} transactions")
    print(f"Unique customers: {df['customer_id'].nunique():,}")
    print(f"Unique SKUs: {df['product_sku'].nunique():,}")
    print(f"Revenue range: ₹{df['net_revenue'].min():,.2f} — ₹{df['net_revenue'].max():,.2f}")
    print(f"Total revenue: ₹{df['net_revenue'].sum():,.2f}")

    # Category breakdown
    print("\nCategory distribution:")
    cat_counts = df["product_category"].value_counts()
    for cat, count in cat_counts.items():
        print(f"  {cat:20s}: {count:6,d} ({count/len(df)*100:.1f}%)")

    # Region breakdown
    print("\nRegion distribution:")
    reg_counts = df["region"].value_counts()
    for reg, count in reg_counts.items():
        print(f"  {reg:20s}: {count:6,d} ({count/len(df)*100:.1f}%)")

    # Save
    config.SYNTHETIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(config.SYNTHETIC_DATA_PATH, index=False)
    print(f"\n✅ Saved to {config.SYNTHETIC_DATA_PATH}")
    print(f"   File size: {config.SYNTHETIC_DATA_PATH.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
