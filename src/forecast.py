"""
Sales forecasting using Facebook Prophet.

Handles data preparation for Prophet format, model training,
prediction, and accuracy evaluation (MAPE).
"""

import pandas as pd
import numpy as np

import config


def prepare_prophet_data(df: pd.DataFrame) -> tuple:
    """
    Aggregate daily revenue into monthly and split into train/validation.

    Returns:
        (train_df, validation_df) — both in Prophet format with columns 'ds' and 'y'
    """
    monthly = (
        df.groupby(pd.Grouper(key="date", freq="MS"))["net_revenue"]
        .sum()
        .reset_index()
        .rename(columns={"date": "ds", "net_revenue": "y"})
    )

    train_end = pd.to_datetime(config.FORECAST_TRAIN_END)
    train = monthly[monthly["ds"] <= train_end].copy()
    validation = monthly[monthly["ds"] > train_end].copy()

    return train, validation


def get_holiday_df() -> pd.DataFrame:
    """
    Create a DataFrame of Indian holidays in Prophet format.
    """
    holidays = pd.DataFrame(config.INDIAN_HOLIDAYS)
    holidays["ds"] = pd.to_datetime(holidays["ds"])
    return holidays


def train_prophet_model(train_df: pd.DataFrame):
    """
    Train a Prophet model on the training data.

    Args:
        train_df: DataFrame with 'ds' and 'y' columns

    Returns:
        Fitted Prophet model
    """
    from prophet import Prophet

    holidays = get_holiday_df()

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,  # Monthly data — no weekly pattern
        daily_seasonality=False,
        holidays=holidays,
        changepoint_prior_scale=0.1,  # Moderate flexibility
        seasonality_prior_scale=10.0,
        interval_width=0.95,
    )

    model.fit(train_df)
    return model


def make_forecast(model, periods: int = 6) -> pd.DataFrame:
    """
    Generate future predictions.

    Args:
        model: Fitted Prophet model
        periods: Number of months to forecast

    Returns:
        Forecast DataFrame with ds, yhat, yhat_lower, yhat_upper
    """
    future = model.make_future_dataframe(periods=periods, freq="MS")
    forecast = model.predict(future)
    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]


def compute_mape(actual: pd.Series, predicted: pd.Series) -> float:
    """
    Compute Mean Absolute Percentage Error.

    Args:
        actual: Actual values
        predicted: Predicted values

    Returns:
        MAPE as a percentage
    """
    actual = actual.values
    predicted = predicted.values
    mask = actual != 0
    if mask.sum() == 0:
        return 0.0
    return np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100


def evaluate_model(model, validation_df: pd.DataFrame) -> dict:
    """
    Evaluate Prophet model on validation data.

    Returns dict with: mape, predictions DataFrame, pass/fail status
    """
    if validation_df.empty:
        return {"mape": None, "predictions": pd.DataFrame(), "status": "no_validation_data"}

    forecast = model.predict(validation_df[["ds"]])
    merged = validation_df.merge(forecast[["ds", "yhat"]], on="ds", how="inner")

    mape = compute_mape(merged["y"], merged["yhat"])

    return {
        "mape": mape,
        "predictions": merged,
        "status": "pass" if mape <= config.MAPE_THRESHOLD else "fail",
    }
