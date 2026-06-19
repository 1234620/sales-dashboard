"""
Prophet model cache — train once at startup, reuse for forecast requests.
"""

from __future__ import annotations

import time
from typing import Any, Optional

import pandas as pd

from src.forecast import make_forecast, prepare_prophet_data, train_prophet_model

# Incremented on each train_prophet_model call (used by tests to verify caching).
train_call_count = 0


class ProphetModelCache:
    """Singleton cache for the fitted Prophet model and prepared train/validation frames."""

    _model: Any = None
    _train_df: Optional[pd.DataFrame] = None
    _validation_df: Optional[pd.DataFrame] = None
    _ready: bool = False
    _error: Optional[str] = None

    @classmethod
    def is_ready(cls) -> bool:
        return cls._ready

    @classmethod
    def error(cls) -> Optional[str]:
        return cls._error

    @classmethod
    def training_periods(cls) -> int:
        return len(cls._train_df) if cls._train_df is not None else 0

    @classmethod
    def validation_df(cls) -> pd.DataFrame:
        return cls._validation_df if cls._validation_df is not None else pd.DataFrame()

    @classmethod
    def initialize(cls, df: pd.DataFrame) -> None:
        """Train and cache the Prophet model from the full unfiltered dataset."""
        global train_call_count
        cls._ready = False
        cls._error = None
        cls._model = None
        cls._train_df = None
        cls._validation_df = None

        if df.empty:
            cls._error = "No data available"
            return

        train_df, validation_df = prepare_prophet_data(df)
        cls._train_df = train_df
        cls._validation_df = validation_df

        if len(train_df) < 12:
            cls._error = "Need at least 12 months of data for reliable forecasting"
            return

        start = time.perf_counter()
        cls._model = train_prophet_model(train_df)
        train_call_count += 1
        elapsed = time.perf_counter() - start
        cls._ready = True
        print(f"✓ Prophet model trained in {elapsed:.2f}s ({len(train_df)} training periods)")

    @classmethod
    def refresh(cls, df: pd.DataFrame) -> None:
        """Re-train the cached model (e.g. after data reload)."""
        cls.initialize(df)

    @classmethod
    def get_forecast(cls, horizon: int) -> pd.DataFrame:
        if not cls._ready or cls._model is None:
            raise RuntimeError(cls._error or "Prophet model is not initialized")
        return make_forecast(cls._model, periods=horizon)
