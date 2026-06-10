from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sys
import os
import json
from datetime import datetime

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

@app.get("/")
def root():
    return {"message": "Sales Dashboard API", "status": "running", "data_rows": len(df)}

@app.get("/api/kpis")
def get_kpis():
    """Get all core KPIs."""
    if df.empty:
        return {"error": "No data available"}
    
    rev = kpis.total_revenue(df)
    aov = kpis.average_order_value(df)
    disc_rate = kpis.discount_impact_rate(df)
    velocity = kpis.sales_velocity(df)
    repeat_rate = kpis.repeat_purchase_rate(df)
    margin = kpis.contribution_margin(df)
    mom = kpis.mom_growth(df)
    
    latest_mom = safe_serialize(mom["mom_growth_pct"].iloc[-1]) if len(mom) > 1 else 0
    
    return {
        "total_revenue": safe_serialize(rev),
        "average_order_value": safe_serialize(aov),
        "discount_impact_rate": safe_serialize(disc_rate),
        "sales_velocity": safe_serialize(velocity),
        "repeat_purchase_rate": safe_serialize(repeat_rate),
        "contribution_margin": safe_serialize(margin),
        "total_transactions": len(df),
        "unique_customers": df["customer_id"].nunique() if "customer_id" in df.columns else 0,
        "mom_growth": latest_mom,
    }

@app.get("/api/revenue-trend")
def get_revenue_trend():
    """Get month-over-month revenue trend."""
    if df.empty:
        return {"error": "No data available"}
    
    mom_df = kpis.mom_growth(df)
    return {
        "data": json.loads(mom_df.to_json(date_format='iso', orient='records'))
    }

@app.get("/api/regional")
def get_regional():
    """Get regional revenue breakdown."""
    if df.empty:
        return {"error": "No data available"}
    
    regional_df = kpis.regional_revenue_share(df)
    return json.loads(regional_df.to_json(orient="records"))

@app.get("/api/categories")
def get_categories():
    """Get product category performance."""
    if df.empty:
        return {"error": "No data available"}
    
    cat_df = kpis.category_contribution_margin(df)
    return json.loads(cat_df.to_json(orient="records"))

@app.get("/api/top-skus")
def get_top_skus(n: int = 10):
    """Get top and bottom SKUs."""
    if df.empty:
        return {"error": "No data available"}
    
    top_df, bottom_df = kpis.top_bottom_skus(df, n=n)
    return {
        "top": json.loads(top_df.to_json(orient="records")),
        "bottom": json.loads(bottom_df.to_json(orient="records")),
    }

@app.get("/api/returns")
def get_returns():
    """Get return rate by category."""
    if df.empty:
        return {"error": "No data available"}
    
    returns_df = kpis.return_rate_by_category(df)
    return json.loads(returns_df.to_json(orient="records"))

@app.get("/api/anomalies")
def get_anomalies():
    """Get anomaly detection results."""
    if df.empty:
        return {"error": "No data available"}
    
    anomaly_df = kpis.anomaly_scores(df)
    return {
        "data": json.loads(anomaly_df.to_json(date_format='iso', orient="records")),
        "total_days": int(len(anomaly_df)),
        "anomalies_count": int(anomaly_df["is_anomaly"].sum()),
    }

@app.get("/api/channel-mix")
def get_channel_mix():
    """Get online vs offline revenue split."""
    if df.empty:
        return {"error": "No data available"}
    
    channel_df = kpis.channel_mix(df)
    return json.loads(channel_df.to_json(orient="records"))

@app.get("/api/forecast")
def get_forecast(horizon: int = 6):
    """Get revenue forecast."""
    try:
        if df.empty:
            return {"error": "No data available"}
        
        train_df, validation_df = prepare_prophet_data(df)
        
        if len(train_df) < 12:
            return {"error": "Need at least 12 months of data for reliable forecasting"}
        
        model = train_prophet_model(train_df)
        forecast_df = make_forecast(model, periods=horizon)
        
        return {
            "forecast": json.loads(forecast_df.to_json(date_format='iso', orient="records")),
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
