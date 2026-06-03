"""
Data ingestion, cleaning, and validation pipeline.

Handles loading from CSV (synthetic or real), type enforcement,
missing value handling, and basic data quality checks.
"""

import pandas as pd
import numpy as np
import streamlit as st
from pathlib import Path

import config


def load_data(filepath: Path = None) -> pd.DataFrame:
    """
    Load sales data from CSV. Tries synthetic data if no path is given.

    Args:
        filepath: Path to CSV file. If None, loads synthetic data.

    Returns:
        Cleaned DataFrame with enforced types.

    Raises:
        FileNotFoundError: If no data file exists at the given path.
    """
    if filepath is None:
        # Try processed first, then synthetic
        if config.PROCESSED_DATA_PATH.exists():
            filepath = config.PROCESSED_DATA_PATH
        elif config.SYNTHETIC_DATA_PATH.exists():
            filepath = config.SYNTHETIC_DATA_PATH
        else:
            raise FileNotFoundError(
                "No data file found. Run `python generate_data.py` first, "
                "or place a CSV in data/processed/ or data/synthetic/."
            )

    df = pd.read_csv(filepath)
    df = _enforce_types(df)
    df = _validate(df)
    df = _clean(df)
    return df


def _enforce_types(df: pd.DataFrame) -> pd.DataFrame:
    """Enforce correct column types."""
    type_map = {
        "transaction_id": "string",
        "product_sku": "string",
        "product_category": "category",
        "customer_id": "string",
        "region": "category",
        "state": "string",
        "channel": "category",
    }

    for col, dtype in type_map.items():
        if col in df.columns:
            df[col] = df[col].astype(dtype)

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

    if "return_flag" in df.columns:
        df["return_flag"] = df["return_flag"].astype(bool)

    numeric_cols = ["quantity", "unit_price", "discount_pct", "net_revenue"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def _validate(df: pd.DataFrame) -> pd.DataFrame:
    """
    Run data quality checks. Logs warnings but doesn't drop rows
    (so the user can see issues in the dashboard).
    """
    issues = []

    # Check for missing required columns
    required = ["transaction_id", "date", "net_revenue", "product_category", "region"]
    missing_cols = [c for c in required if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    # Check for duplicate transaction IDs
    dup_count = df["transaction_id"].duplicated().sum()
    if dup_count > 0:
        issues.append(f"⚠️ {dup_count} duplicate transaction IDs found")

    # Check for null dates
    null_dates = df["date"].isna().sum()
    if null_dates > 0:
        issues.append(f"⚠️ {null_dates} rows with missing dates")

    # Check for negative revenue
    neg_rev = (df["net_revenue"] < 0).sum()
    if neg_rev > 0:
        issues.append(f"⚠️ {neg_rev} rows with negative net_revenue")

    # Check for out-of-range discounts
    if "discount_pct" in df.columns:
        bad_disc = ((df["discount_pct"] < 0) | (df["discount_pct"] > 1)).sum()
        if bad_disc > 0:
            issues.append(f"⚠️ {bad_disc} rows with discount_pct outside [0, 1]")

    if issues:
        for issue in issues:
            st.warning(issue)

    return df


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean data: drop rows with null dates, fill minor missing values.
    """
    # Drop rows where date is null (can't do time-series without dates)
    df = df.dropna(subset=["date"])

    # Fill missing discount_pct with 0 (no discount)
    if "discount_pct" in df.columns:
        df["discount_pct"] = df["discount_pct"].fillna(0.0)

    # Fill missing return_flag with False
    if "return_flag" in df.columns:
        df["return_flag"] = df["return_flag"].fillna(False)

    # Add derived columns
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["year_month"] = df["date"].dt.to_period("M").astype(str)
    df["day_of_week"] = df["date"].dt.day_name()

    # Gross revenue (before discount)
    if "unit_price" in df.columns and "quantity" in df.columns:
        df["gross_revenue"] = df["unit_price"] * df["quantity"]

    return df


def filter_data(
    df: pd.DataFrame,
    date_range: tuple = None,
    regions: list = None,
    categories: list = None,
    channels: list = None,
) -> pd.DataFrame:
    """
    Apply sidebar filters to the dataset.

    Args:
        df: Full dataset
        date_range: (start_date, end_date) tuple
        regions: List of region names to include
        categories: List of product categories to include
        channels: List of channels to include

    Returns:
        Filtered DataFrame
    """
    filtered = df.copy()

    if date_range:
        start, end = pd.to_datetime(date_range[0]), pd.to_datetime(date_range[1])
        filtered = filtered[(filtered["date"] >= start) & (filtered["date"] <= end)]

    if regions:
        filtered = filtered[filtered["region"].isin(regions)]

    if categories:
        filtered = filtered[filtered["product_category"].isin(categories)]

    if channels:
        filtered = filtered[filtered["channel"].isin(channels)]

    return filtered
