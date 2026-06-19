"""
API integration tests for the FastAPI backend.

Run with:
    python3 -m pytest tests/test_api.py -v
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from src import model_cache


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


class TestHealth:
    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "healthy"
        assert "data_loaded" in body
        assert "prophet_cached" in body


class TestKPIs:
    def test_kpis_expected_keys(self, client):
        response = client.get("/api/kpis")
        assert response.status_code == 200
        body = response.json()
        assert "error" not in body
        expected_keys = {
            "total_revenue",
            "average_order_value",
            "discount_impact_rate",
            "sales_velocity",
            "repeat_purchase_rate",
            "contribution_margin",
            "total_transactions",
            "unique_customers",
            "mom_growth",
            "yoy_growth",
        }
        assert expected_keys.issubset(body.keys())


class TestYoYGrowth:
    def test_yoy_growth_array_shape(self, client):
        response = client.get("/api/yoy-growth")
        assert response.status_code == 200
        body = response.json()
        assert "error" not in body
        assert "data" in body
        assert isinstance(body["data"], list)
        if body["data"]:
            row = body["data"][0]
            assert "month" in row
            assert "label" in row
            assert "yoy_growth_pct" in row


class TestAnomalies:
    def test_flagged_only_smaller_than_full_series(self, client):
        full = client.get("/api/anomalies").json()
        flagged = client.get("/api/anomalies?flagged_only=true").json()
        assert len(flagged["data"]) < len(full["data"])
        assert flagged["total_days"] == full["total_days"]
        assert flagged["anomalies_count"] == full["anomalies_count"]
        assert all(row["is_anomaly"] for row in flagged["data"])


class TestForecastCache:
    def test_forecast_does_not_retrain_on_each_request(self, client):
        initial_train_count = model_cache.train_call_count
        first = client.get("/api/forecast?horizon=6")
        second = client.get("/api/forecast?horizon=12")
        assert first.status_code == 200
        assert second.status_code == 200
        assert model_cache.train_call_count == initial_train_count

        first_body = first.json()
        second_body = second.json()
        if "error" not in first_body:
            assert "forecast" in first_body
            assert len(second_body.get("forecast", [])) >= len(first_body.get("forecast", []))
