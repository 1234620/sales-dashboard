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
import config
from src import kpis


@pytest.fixture
def sample_data():
    """Create a small, deterministic dataset for testing."""
    data = {
        "transaction_id": ["TXN-001", "TXN-002", "TXN-003", "TXN-004", "TXN-005"],
        "date": pd.to_datetime([
            "2024-01-15", "2024-01-20", "2024-02-10", "2024-02-15", "2024-03-01"
        ]),
        "product_sku": [
            "LITCHI-DRINK-250ML-48PCS",
            "POTATA-BISCUIT-75GM-48PCS",
            "LITCHI-DRINK-250ML-48PCS",
            "KOPIKO-PKT-47MRP",
            "SHAN-BIRYANI",
        ],
        "product_category": [
            "Beverages",
            "Bakery & Biscuits",
            "Beverages",
            "Confectionery",
            "Spice Mixes",
        ],
        "quantity": [1, 2, 1, 1, 3],
        "unit_price": [50000.0, 1500.0, 50000.0, 5000.0, 500.0],
        "discount_pct": [0.10, 0.05, 0.15, 0.0, 0.20],
        "net_revenue": [45000.0, 2850.0, 42500.0, 5000.0, 1200.0],
        "customer_id": ["CUST-001", "CUST-002", "CUST-001", "CUST-003", "CUST-002"],
        "region": ["West", "South", "West", "North", "East"],
        "state": ["Maharashtra", "Karnataka", "Maharashtra", "Delhi", "West Bengal"],
        "channel": ["online", "offline", "online", "offline", "online"],
        "return_flag": [False, False, True, False, False],
        "stock_constrained": [False, False, False, True, False],
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


class TestStateRevenueShare:
    def test_states_within_region(self, sample_data):
        region = sample_data["region"].iloc[0]
        result = kpis.state_revenue_share(sample_data, region)
        assert "state" in result.columns
        assert "revenue" in result.columns
        assert "share_pct" in result.columns
        if not result.empty:
            assert abs(result["share_pct"].sum() - 100.0) < 0.1

    def test_unknown_region_returns_empty(self, sample_data):
        result = kpis.state_revenue_share(sample_data, "Nonexistent")
        assert result.empty


class TestRegionCategoryHeatmap:
    def test_matrix_shape(self, sample_data):
        result = kpis.region_category_heatmap(sample_data)
        assert "regions" in result
        assert "categories" in result
        assert "values" in result
        if result["regions"]:
            assert len(result["values"]) == len(result["regions"])
            assert all(len(row) == len(result["categories"]) for row in result["values"])


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

    def test_beverages_has_returns(self, sample_data):
        result = kpis.return_rate_by_category(sample_data)
        beverages = result[result["product_category"] == "Beverages"]
        assert beverages["returned_units"].values[0] == 1  # TXN-003 is a return


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


class TestCategoryContributionMargin:
    def test_margin_pct_non_negative(self, sample_data):
        result = kpis.category_contribution_margin(sample_data)
        assert (result["margin_pct"] >= 0).all()
        assert (result["margin"] > 0).all()

    def test_no_double_discount(self, sample_data):
        beverages = sample_data[sample_data["product_category"] == "Beverages"]
        result = kpis.category_contribution_margin(sample_data)
        row = result[result["product_category"] == "Beverages"].iloc[0]
        revenue = beverages["net_revenue"].sum()
        returns = beverages.loc[beverages["return_flag"], "net_revenue"].sum()
        import config
        expected_margin = revenue - returns - revenue * config.FULFILLMENT_COST_RATE
        assert abs(row["margin"] - expected_margin) < 0.01

    def test_categorical_product_category(self, sample_data):
        df = sample_data.copy()
        df["product_category"] = df["product_category"].astype("category")
        result = kpis.category_contribution_margin(df)
        assert len(result) == df["product_category"].nunique()


class TestFestiveSeasonUplift:
    def test_uses_unique_days_not_row_counts(self):
        """Multiple transactions on one festive day must not dilute the daily average."""
        dates = [pd.Timestamp("2024-03-05")] * 10 + [pd.Timestamp("2024-06-01")]
        df = pd.DataFrame({
            "date": dates,
            "net_revenue": [1000.0] * 11,
        })
        result = kpis.festive_season_uplift(df)
        holi = result[result["festival"] == "Holi"].iloc[0]
        # 10k on one Holi day vs 1k on one normal day → ~900% uplift, not 0%
        assert holi["uplift_pct"] > 100


class TestYoYGrowth:
    def test_returns_chart_columns(self, sample_data):
        df = pd.concat(
            [
                sample_data.assign(year=2023, year_month="2023-01"),
                sample_data.assign(year=2024),
            ],
            ignore_index=True,
        )
        result = kpis.yoy_growth(df)
        assert list(result.columns) == [
            "month", "label", "yoy_growth_pct", "current_revenue", "prior_revenue"
        ]
        assert len(result) == 3

    def test_partial_current_year_omits_future_months(self, sample_data):
        """Months beyond latest data in current year must not show -100% YoY."""
        prior = sample_data.copy()
        prior["year"] = 2025
        prior["year_month"] = prior["date"].dt.strftime("%Y-%m")
        current = sample_data[sample_data["month"] == 1].copy()
        current["year"] = 2026
        current["year_month"] = "2026-01"
        df = pd.concat([prior, current], ignore_index=True)
        result = kpis.yoy_growth(df)
        assert len(result) == 1
        assert int(result.iloc[0]["month"]) == 1

    def test_single_year_returns_empty(self, sample_data):
        result = kpis.yoy_growth(sample_data)
        assert result.empty


class TestAnomalyScores:
    def _daily_df(self, rows):
        return pd.DataFrame(rows)

    def test_requires_zscore_and_min_delta(self):
        dates = pd.date_range("2024-01-01", periods=40, freq="D")
        revenues = [400_000.0] * 40
        revenues[30] = 401_000.0  # tiny bump: high z unlikely, low delta
        df = self._daily_df({
            "date": dates,
            "net_revenue": revenues,
        })
        result = kpis.anomaly_scores(df)
        assert not result["is_anomaly"].any()

    def test_festive_day_excluded(self, monkeypatch):
        monkeypatch.setattr(config, "ANOMALY_EXCLUDE_FESTIVE_DAYS", True)
        monkeypatch.setattr(config, "ANOMALY_MIN_REVENUE_DELTA", 1_000)
        monkeypatch.setattr(config, "ZSCORE_THRESHOLD", 1.5)
        dates = pd.date_range("2024-03-01", periods=40, freq="D")
        revenues = [300_000.0] * 40
        revenues[10] = 1_500_000.0  # Holi window spike on 2024-03-11
        df = self._daily_df({
            "date": dates,
            "net_revenue": revenues,
        })
        result = kpis.anomaly_scores(df)
        holi_row = result[result["date"] == pd.Timestamp("2024-03-11")]
        assert len(holi_row) == 1
        assert holi_row["is_anomaly"].iloc[0] is False or holi_row["is_anomaly"].iloc[0] == False

    def test_flags_large_non_festive_deviation(self, monkeypatch):
        monkeypatch.setattr(config, "ANOMALY_EXCLUDE_FESTIVE_DAYS", True)
        monkeypatch.setattr(config, "ANOMALY_MIN_REVENUE_DELTA", 100_000)
        monkeypatch.setattr(config, "ZSCORE_THRESHOLD", 2.0)
        dates = pd.date_range("2024-06-01", periods=40, freq="D")
        revenues = [400_000.0] * 40
        revenues[25] = 1_200_000.0
        df = self._daily_df({
            "date": dates,
            "net_revenue": revenues,
        })
        result = kpis.anomaly_scores(df)
        assert result["is_anomaly"].sum() >= 1
