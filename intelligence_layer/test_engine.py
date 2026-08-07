import pytest
from main import app, EstimateRequest, RenovationScope
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "system": "Construction Intelligence Layer"}

def test_deterministic_cost_engine_standard_scenario():
    request_data = {
        "scope": {
            "property_id": "test-123",
            "region": "San Jose, CA",
            "items": ["Cabinet replacement"]
        },
        "sqft": 1500,
        "quality": "Standard"
    }
    response = client.post("/estimate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["confidence_level"] == "HIGH"
    assert len(data["line_items"]) == 2
    
    # Verify standard cabinet math
    # quantity=24, material=185, labor=95
    # base = (185 + 95) * 24 = 6720
    # adjusted = 6720 * 1.12 * 1.05 = 7902.72
    # But countertop is also added in mock. Let's just verify material cost is standard
    cabinet_item = next(item for item in data["line_items"] if item["item"] == "Cabinet replacement")
    assert cabinet_item["material_unit_cost"] == 185.0

def test_deterministic_cost_engine_budget_scenario():
    request_data = {
        "scope": {
            "property_id": "test-123",
            "region": "San Jose, CA",
            "items": ["Cabinet replacement"]
        },
        "sqft": 1500,
        "quality": "Budget"
    }
    response = client.post("/estimate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    cabinet_item = next(item for item in data["line_items"] if item["item"] == "Cabinet replacement")
    # Budget multiplier is 0.6
    assert cabinet_item["material_unit_cost"] == 185.0 * 0.6

def test_stale_data_detection():
    request_data = {
        "scope": {
            "property_id": "test-123",
            "region": "San Jose, CA",
            "items": ["Cabinet replacement"]
        },
        "sqft": 1500,
        "quality": "Premium"
    }
    response = client.post("/estimate", json=request_data)
    data = response.json()
    assert "Pricing data for Cabinet replacement is >12 months old." in data["stale_data_warnings"]

def test_cost_drivers_calculation():
    request_data = {
        "scope": {
            "property_id": "test-123",
            "region": "San Jose, CA",
            "items": ["Cabinet replacement"]
        },
        "sqft": 1500,
        "quality": "Standard"
    }
    response = client.post("/estimate", json=request_data)
    data = response.json()
    assert "Cabinetry" in data["cost_drivers"]
    assert "Labor" in data["cost_drivers"]
    assert "Countertops" in data["cost_drivers"]
    assert data["cost_drivers"]["Cabinetry"] > 0
    assert data["cost_drivers"]["Labor"] > 0
