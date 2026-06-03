"""
Unit tests for KPI computation functions.

Run with:
    python -m pytest tests/ -v
"""

import pandas as pd
import numpy as np
import pytest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src import kpis


@pytest.fixture
def sample_data():
    """Create a small, deterministic dataset for testing."""
    data = {
        "transaction_id": ["TXN-001", "TXN-002", "TXN-003", "TXN-004", "TXN-005"],
        "date": pd.to_datetime([
            "2024-01-15", "2024-01-20", "2024-02-10", "2024-02-15", "2024-03-01"
        ]),
        "product_sku": ["ELEC-TV-01", "FASH-SHIRT-01", "ELEC-TV-01", "HOME-MIXER-01", "BOOK-NOVEL-01"],
        "product_category": ["Electronics", "Fashion", "Electronics", "Home & Kitchen", "Books"],
        "quantity": [1, 2, 1, 1, 3],
        "unit_price": [50000.0, 1500.0, 50000.0, 5000.0, 500.0],
        "discount_pct": [0.10, 0.05, 0.15, 0.0, 0.20],
        "net_revenue": [45000.0, 2850.0, 42500.0, 5000.0, 1200.0],
        "customer_id": ["CUST-001", "CUST-002", "CUST-001", "CUST-003", "CUST-002"],
        "region": ["West", "South", "West", "North", "East"],
        "state": ["Maharashtra", "Karnataka", "Maharashtra", "Delhi", "West Bengal"],
        "channel": ["online", "offline", "online", "offline", "online"],
        "return_flag": [False, False, True, False, False],
        "gross_revenue": [50000.0, 3000.0, 50000.0, 5000.0, 1500.0],
        "year_month": ["2024-01", "2024-01", "2024-02", "2024-02", "2024-03"],
        "year": [2024, 2024, 2024, 2024, 2024],
        "month": [1, 1, 2, 2, 3],
    }
    return pd.DataFrame(data)


class TestTotalRevenue:
    def test_basic(self, sample_data):
        result = kpis.total_revenue(sample_data)
        expected = 45000 + 2850 + 42500 + 5000 + 1200
        assert result == expected

    def test_empty_df(self, sample_data):
        empty = sample_data.iloc[:0]
        assert kpis.total_revenue(empty) == 0.0


class TestAverageOrderValue:
    def test_basic(self, sample_data):
        result = kpis.average_order_value(sample_data)
        expected = (45000 + 2850 + 42500 + 5000 + 1200) / 5
        assert result == expected

    def test_empty_df(self, sample_data):
        empty = sample_data.iloc[:0]
        assert kpis.average_order_value(empty) == 0.0


class TestDiscountImpactRate:
    def test_basic(self, sample_data):
        result = kpis.discount_impact_rate(sample_data)
        gross = 50000 + 3000 + 50000 + 5000 + 1500
        net = 45000 + 2850 + 42500 + 5000 + 1200
        expected = (gross - net) / gross
        assert abs(result - expected) < 0.001


class TestMoMGrowth:
    def test_returns_dataframe(self, sample_data):
        result = kpis.mom_growth(sample_data)
        assert isinstance(result, pd.DataFrame)
        assert "year_month" in result.columns
        assert "revenue" in result.columns
        assert "mom_growth_pct" in result.columns

    def test_first_month_is_nan(self, sample_data):
        result = kpis.mom_growth(sample_data)
        assert pd.isna(result["mom_growth_pct"].iloc[0])


class TestRegionalRevenueShare:
    def test_shares_sum_to_100(self, sample_data):
        result = kpis.regional_revenue_share(sample_data)
        total_share = result["share_pct"].sum()
        assert abs(total_share - 100.0) < 0.1

    def test_all_regions_present(self, sample_data):
        result = kpis.regional_revenue_share(sample_data)
        regions_in_data = sample_data["region"].unique()
        assert set(result["region"]) == set(regions_in_data)


class TestRepeatPurchaseRate:
    def test_basic(self, sample_data):
        # CUST-001 has 2 txns, CUST-002 has 2 txns → 4 repeat txns out of 5
        result = kpis.repeat_purchase_rate(sample_data)
        assert result == (4 / 5) * 100

    def test_no_repeats(self, sample_data):
        # Make all customer IDs unique
        df = sample_data.copy()
        df["customer_id"] = [f"UNIQUE-{i}" for i in range(len(df))]
        result = kpis.repeat_purchase_rate(df)
        assert result == 0.0


class TestReturnRate:
    def test_basic(self, sample_data):
        result = kpis.return_rate_by_category(sample_data)
        assert isinstance(result, pd.DataFrame)
        assert "return_rate" in result.columns

    def test_electronics_has_returns(self, sample_data):
        result = kpis.return_rate_by_category(sample_data)
        elec = result[result["product_category"] == "Electronics"]
        assert elec["returned_units"].values[0] == 1  # TXN-003 is a return


class TestChannelMix:
    def test_shares_sum_to_100(self, sample_data):
        result = kpis.channel_mix(sample_data)
        total = result["share_pct"].sum()
        assert abs(total - 100.0) < 0.1

    def test_two_channels(self, sample_data):
        result = kpis.channel_mix(sample_data)
        assert len(result) == 2


class TestSalesVelocity:
    def test_basic(self, sample_data):
        result = kpis.sales_velocity(sample_data)
        total_rev = sample_data["net_revenue"].sum()
        days = (sample_data["date"].max() - sample_data["date"].min()).days
        expected = total_rev / days
        assert abs(result - expected) < 0.01

    def test_empty(self, sample_data):
        empty = sample_data.iloc[:0]
        assert kpis.sales_velocity(empty) == 0.0
