"""Smoke tests for synthetic data generator helpers."""

import numpy as np
import pandas as pd
import pytest

import config
from generate_data import (
    apply_stock_constraint,
    inflation_factor,
    period_close_multiplier,
    region_channel_probs,
    sample_reorder_gap,
)


class TestInflationFactor:
    def test_increases_over_time(self):
        np.random.seed(0)
        start = pd.Timestamp("2023-01-01")
        mid = pd.Timestamp("2024-06-01")
        end = pd.Timestamp("2026-01-01")

        f_start = inflation_factor(start, annual_rate=0.05, monthly_noise=0.0)
        f_mid = inflation_factor(mid, annual_rate=0.05, monthly_noise=0.0)
        f_end = inflation_factor(end, annual_rate=0.05, monthly_noise=0.0)

        assert f_start == pytest.approx(1.0, rel=1e-3)
        assert f_mid > f_start
        assert f_end > f_mid

    def test_monthly_noise_bounded(self):
        np.random.seed(42)
        date = pd.Timestamp("2024-03-15")
        factors = [inflation_factor(date, annual_rate=0.0, monthly_noise=0.01) for _ in range(200)]
        assert all(0.99 <= f <= 1.01 for f in factors)


class TestReorderGap:
    def test_gap_within_config_bounds(self):
        np.random.seed(7)
        gaps = [sample_reorder_gap() for _ in range(500)]
        assert all(config.REORDER_GAP_MIN_DAYS <= g <= config.REORDER_GAP_MAX_DAYS for g in gaps)


class TestPeriodCloseMultiplier:
    def test_month_end_at_least_one(self):
        np.random.seed(1)
        month_end = pd.Timestamp("2024-03-31")
        assert period_close_multiplier(month_end) >= 1.0

    def test_mid_month_near_one(self):
        mid = pd.Timestamp("2024-03-10")
        assert period_close_multiplier(mid) == 1.0


class TestRegionChannelBias:
    def test_west_more_offline_than_south(self):
        west_off, _west_on = region_channel_probs("West")
        south_off, south_on = region_channel_probs("South")
        assert west_off > south_off
        assert south_on > _west_on


class TestStockConstraint:
    def test_low_popularity_never_constrained(self):
        qty, constrained = apply_stock_constraint(10, popularity=0.02)
        assert qty == 10
        assert constrained is False

    def test_high_popularity_can_reduce_quantity(self):
        np.random.seed(123)
        found = False
        for _ in range(1000):
            qty, flag = apply_stock_constraint(10, popularity=0.10)
            if flag:
                assert qty < 10
                found = True
                break
        assert found


@pytest.mark.slow
def test_full_regeneration_row_count():
    """Optional slow test — run with `pytest -m slow`."""
    from generate_data import generate_dates, generate_transactions

    dates = generate_dates()
    df = generate_transactions(dates)
    assert len(df) >= 80_000
    assert "stock_constrained" in df.columns
    assert df["stock_constrained"].dtype == bool
