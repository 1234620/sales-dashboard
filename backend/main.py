from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sys
import os
import json
from datetime import datetime
from typing import List, Optional

# Add parent dir to path to import src modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data import load_data, filter_data
from src import kpis
from src.forecast import prepare_prophet_data, train_prophet_model, make_forecast

app = FastAPI(title="Sales Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data once at startup
try:
    df = load_data()
    print(f"✓ Loaded data: {len(df)} rows")
except Exception as e:
    df = pd.DataFrame()
    print(f"Failed to load data: {e}")

def safe_serialize(obj):
    """Convert pandas types to native Python types for JSON serialization."""
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, (pd.Series, pd.Index)):
        return obj.tolist()
    elif isinstance(obj, (int, float)):
        return float(obj) if not pd.isna(obj) else 0
    elif isinstance(obj, bool):
        return bool(obj)
    return str(obj) if obj is not None else None

def get_filtered_df(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    regions: Optional[List[str]] = Query(None),
    categories: Optional[List[str]] = Query(None),
    channels: Optional[List[str]] = Query(None),
):
    if df.empty:
        return df
    
    date_range = None
    if start_date and end_date:
        date_range = (start_date, end_date)
        
    return filter_data(
        df,
        date_range=date_range,
        regions=regions,
        categories=categories,
        channels=channels
    )

@app.get("/")
def root():
    return {"message": "Sales Dashboard API", "status": "running", "data_rows": len(df)}

@app.get("/api/kpis")
def get_kpis(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get all core KPIs."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    rev = kpis.total_revenue(filtered_df)
    aov = kpis.average_order_value(filtered_df)
    disc_rate = kpis.discount_impact_rate(filtered_df)
    velocity = kpis.sales_velocity(filtered_df)
    repeat_rate = kpis.repeat_purchase_rate(filtered_df)
    margin = kpis.contribution_margin(filtered_df)
    mom = kpis.mom_growth(filtered_df)
    
    latest_mom = safe_serialize(mom["mom_growth_pct"].iloc[-1]) if len(mom) > 1 else 0
    
    return {
        "total_revenue": safe_serialize(rev),
        "average_order_value": safe_serialize(aov),
        "discount_impact_rate": safe_serialize(disc_rate),
        "sales_velocity": safe_serialize(velocity),
        "repeat_purchase_rate": safe_serialize(repeat_rate),
        "contribution_margin": safe_serialize(margin),
        "total_transactions": len(filtered_df),
        "unique_customers": filtered_df["customer_id"].nunique() if "customer_id" in filtered_df.columns else 0,
        "mom_growth": latest_mom,
    }

@app.get("/api/revenue-trend")
def get_revenue_trend(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get month-over-month revenue trend."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    mom_df = kpis.mom_growth(filtered_df)
    return {
        "data": json.loads(mom_df.to_json(date_format='iso', orient='records'))
    }

@app.get("/api/regional")
def get_regional(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get regional revenue breakdown."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    regional_df = kpis.regional_revenue_share(filtered_df)
    return json.loads(regional_df.to_json(orient="records"))

@app.get("/api/categories")
def get_categories(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get product category performance."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    cat_df = kpis.category_contribution_margin(filtered_df)
    return json.loads(cat_df.to_json(orient="records"))

@app.get("/api/top-skus")
def get_top_skus(n: int = 10, filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get top and bottom SKUs."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    top_df, bottom_df = kpis.top_bottom_skus(filtered_df, n=n)
    return {
        "top": json.loads(top_df.to_json(orient="records")),
        "bottom": json.loads(bottom_df.to_json(orient="records")),
    }

@app.get("/api/returns")
def get_returns(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get return rate by category."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    returns_df = kpis.return_rate_by_category(filtered_df)
    return json.loads(returns_df.to_json(orient="records"))

@app.get("/api/anomalies")
def get_anomalies(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get anomaly detection results."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    anomaly_df = kpis.anomaly_scores(filtered_df)
    return {
        "data": json.loads(anomaly_df.to_json(date_format='iso', orient="records")),
        "total_days": int(len(anomaly_df)),
        "anomalies_count": int(anomaly_df["is_anomaly"].sum()),
    }

@app.get("/api/channel-mix")
def get_channel_mix(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get online vs offline revenue split."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    channel_df = kpis.channel_mix(filtered_df)
    return json.loads(channel_df.to_json(orient="records"))

@app.get("/api/daily-revenue")
def get_daily_revenue(group_by: str = None, filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get daily revenue data for moving averages, optionally grouped."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    if group_by == "region" and "region" in filtered_df.columns:
        daily = (
            filtered_df.groupby(["date", "region"])["net_revenue"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
    elif group_by == "category" and "product_category" in filtered_df.columns:
        daily = (
            filtered_df.groupby(["date", "product_category"])["net_revenue"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
    else:
        daily = (
            filtered_df.groupby("date")["net_revenue"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
        
    return {
        "data": json.loads(daily.to_json(date_format='iso', orient='records'))
    }

@app.get("/api/festive-uplift")
def get_festive_uplift(filtered_df: pd.DataFrame = Depends(get_filtered_df)):
    """Get festive season revenue uplift."""
    if filtered_df.empty:
        return {"error": "No data available"}
    
    uplift_df = kpis.festive_season_uplift(filtered_df)
    return json.loads(uplift_df.to_json(orient="records"))

@app.get("/api/forecast")
def get_forecast(horizon: int = 6):
    """Get revenue forecast (uses full dataset for continuity)."""
    try:
        if df.empty:
            return {"error": "No data available"}
        
        train_df, validation_df = prepare_prophet_data(df)
        
        if len(train_df) < 12:
            return {"error": "Need at least 12 months of data for reliable forecasting"}
        
        model = train_prophet_model(train_df)
        forecast_df = make_forecast(model, periods=horizon)
        
        # Merge actual validation data if present
        return {
            "forecast": json.loads(forecast_df.to_json(date_format='iso', orient="records")),
            "validation": json.loads(validation_df.to_json(date_format='iso', orient="records")) if not validation_df.empty else [],
            "training_periods": len(train_df),
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "data_loaded": not df.empty,
        "rows": len(df),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
