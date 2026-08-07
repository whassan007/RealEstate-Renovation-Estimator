from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from search_service import fetch_real_properties

app = FastAPI(title="Construction Estimation Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Models ---
class RenovationScope(BaseModel):
    property_id: str
    region: str
    items: List[str]

class EstimateRequest(BaseModel):
    scope: RenovationScope
    sqft: int
    quality: str = "Standard"

class CostLineItem(BaseModel):
    item: str
    quantity: float
    unit: str
    material_unit_cost: float
    labor_unit_cost: float
    regional_adjustment: float
    waste_factor: float
    source: str
    source_date: str
    confidence: float

class EstimateResponse(BaseModel):
    min_total: float
    max_total: float
    confidence_score: float
    confidence_level: str
    line_items: List[CostLineItem]
    cost_drivers: Dict[str, float]
    assumptions: List[str]
    unknowns: List[str]
    stale_data_warnings: List[str]

# --- Endpoints ---
@app.post("/estimate", response_model=EstimateResponse)
async def generate_estimate(request: EstimateRequest):
    """
    Core Deterministic Cost Engine Endpoint.
    """
    logger.info(f"Generating estimate for scope: {request.scope} with quality: {request.quality}")
    
    quality = request.quality
    
    # Scenario Quality multipliers (affects actual material cost selection, not just total)
    material_multiplier = 1.0
    if quality == 'Budget': material_multiplier = 0.6
    if quality == 'Premium': material_multiplier = 1.8
    
    line_items = [
        CostLineItem(
            item="Cabinet replacement",
            quantity=24,
            unit="LF",
            material_unit_cost=185.0 * material_multiplier,
            labor_unit_cost=95.0,
            regional_adjustment=1.12,
            waste_factor=0.05,
            source="OpenConstructionEstimate",
            source_date="2024-05-01",  # Intentionally old to trigger stale warning
            confidence=0.82
        ),
        CostLineItem(
            item="Countertop",
            quantity=48,
            unit="SF",
            material_unit_cost=65.0 * material_multiplier,
            labor_unit_cost=35.0,
            regional_adjustment=1.12,
            waste_factor=0.10,
            source="OpenConstructionEstimate",
            source_date="2026-08-01",
            confidence=0.85
        )
    ]
    
    # Deterministic Total Calculation
    min_total = 0
    max_total = 0
    cat_totals = {"Cabinetry": 0, "Labor": 0, "Countertops": 0, "Other": 0}
    
    stale_warnings = []
    
    for item in line_items:
        # Arithmetic logic check
        material_cost = item.material_unit_cost * item.quantity
        labor_cost = item.labor_unit_cost * item.quantity
        
        if "Cabinet" in item.item: cat_totals["Cabinetry"] += material_cost
        if "Countertop" in item.item: cat_totals["Countertops"] += material_cost
        cat_totals["Labor"] += labor_cost
        
        base_cost = material_cost + labor_cost
        adjusted_cost = base_cost * item.regional_adjustment * (1 + item.waste_factor)
        
        min_total += adjusted_cost * 0.9 
        max_total += adjusted_cost * 1.1
        
        if "2024" in item.source_date:
            stale_warnings.append(f"Pricing data for {item.item} is >12 months old.")

    # Calculate cost drivers percentages
    total_raw = sum(cat_totals.values())
    cost_drivers = {k: round((v / total_raw) * 100) for k, v in cat_totals.items() if v > 0}

    return EstimateResponse(
        min_total=round(min_total, 2),
        max_total=round(max_total, 2),
        confidence_score=0.84,
        confidence_level="HIGH",
        line_items=line_items,
        cost_drivers=cost_drivers,
        assumptions=[
            f"{quality} finish materials selected",
            "Standard labor productivity assumed",
            "No structural changes required"
        ],
        unknowns=[
            "Whether plumbing must be relocated",
            "Existing wall condition behind cabinets"
        ],
        stale_data_warnings=stale_warnings
    )

@app.get("/properties")
async def get_properties(query: str):
    """
    Fetches real property listings using Google Custom Search and parses them.
    """
    logger.info(f"Fetching real properties for query: {query}")
    properties = await fetch_real_properties(query)
    return {"properties": properties}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
