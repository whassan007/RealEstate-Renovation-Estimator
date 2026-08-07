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
    
    # Layer A: Simulated Retail Material Data (Home Depot CA)
    drywall_retail_price = 17.98 # CAD per sheet
    cabinet_retail_price = 349.00 # CAD per LF base
    
    # Layer B/C: Work Assemblies using hybrid pricing
    assemblies = [
        {
            "assembly": "Install Drywall Interior Wall",
            "quantity": 1000,
            "unit": "SF",
            "material_unit_cost": drywall_retail_price / 32, # price per SF approx
            "labor_unit_cost": 1.50, # DDC CWICR benchmark
            "equipment_unit_cost": 0.10,
            "waste_factor": 0.10,
            "delivery_cost": 75.0,
            "regional_adjustment": 1.05,
            "source": "DDC_CWICR + HomeDepotCA",
            "source_date": "2026-08-01"
        },
        {
            "assembly": "Cabinet Replacement",
            "quantity": 24,
            "unit": "LF",
            "material_unit_cost": cabinet_retail_price * material_multiplier,
            "labor_unit_cost": 95.0, # RSMeans benchmark
            "equipment_unit_cost": 5.0,
            "waste_factor": 0.05,
            "delivery_cost": 150.0,
            "regional_adjustment": 1.12,
            "source": "RSMeans + HomeDepotCA",
            "source_date": "2026-08-01"
        }
    ]
    
    line_items = []
    
    # Deterministic Total Calculation
    min_total = 0
    max_total = 0
    cat_totals = {"Material": 0, "Labor": 0, "Equipment": 0, "Waste": 0, "Delivery": 0, "OH&P": 0}
    
    stale_warnings = []
    
    for asm in assemblies:
        # Calculate raw costs
        material_cost = asm["material_unit_cost"] * asm["quantity"]
        labor_cost = asm["labor_unit_cost"] * asm["quantity"]
        equipment_cost = asm["equipment_unit_cost"] * asm["quantity"]
        waste_cost = material_cost * asm["waste_factor"]
        
        # Subtotal for assembly
        base_cost = material_cost + labor_cost + equipment_cost + waste_cost + asm["delivery_cost"]
        adjusted_cost = base_cost * asm["regional_adjustment"]
        
        # Add Contractor OH&P (Overhead & Profit) - 20%
        ohp_cost = adjusted_cost * 0.20
        final_cost = adjusted_cost + ohp_cost
        
        # Aggregate to categories
        # Aggregate to categories
        cat_totals["Material"] += material_cost
        cat_totals["Labor"] += labor_cost
        cat_totals["Equipment"] += equipment_cost
        cat_totals["Waste"] += waste_cost
        cat_totals["Delivery"] += asm["delivery_cost"]
        cat_totals["OH&P"] += ohp_cost
        
        # Build CostLineItem for response compatibility
        line_items.append(CostLineItem(
            item=asm["assembly"],
            quantity=asm["quantity"],
            unit=asm["unit"],
            material_unit_cost=asm["material_unit_cost"],
            labor_unit_cost=asm["labor_unit_cost"],
            regional_adjustment=asm["regional_adjustment"],
            waste_factor=asm["waste_factor"],
            source=asm["source"],
            source_date=asm["source_date"],
            confidence=0.88
        ))
        
        min_total += final_cost * 0.9 
        max_total += final_cost * 1.1

    # Apply Timing Overhead and Market Price Markups
    # Timing overhead is assumed 5% of base total for project management / delays
    timing_overhead = (max_total + min_total) / 2 * 0.05
    # Market markup due to inflation/volatility is 3%
    market_markup = (max_total + min_total) / 2 * 0.03
    
    line_items.append(CostLineItem(
        item="Timing / Schedule Overhead",
        quantity=1,
        unit="LS",
        material_unit_cost=0,
        labor_unit_cost=timing_overhead,
        regional_adjustment=1.0,
        waste_factor=0.0,
        source="Market Timing Data",
        source_date="2026-08-01",
        confidence=0.90
    ))
    
    line_items.append(CostLineItem(
        item="Market Price Fluctuation Markup",
        quantity=1,
        unit="LS",
        material_unit_cost=market_markup,
        labor_unit_cost=0,
        regional_adjustment=1.0,
        waste_factor=0.0,
        source="Market Volatility Index",
        source_date="2026-08-01",
        confidence=0.90
    ))
    
    min_total += (timing_overhead + market_markup) * 0.9
    max_total += (timing_overhead + market_markup) * 1.1
    
    cat_totals["Timing/Overhead"] = timing_overhead
    cat_totals["Market Markup"] = market_markup

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

@app.get("/inventory")
async def get_inventory():
    """
    Returns the reconstruction inventory and respective pricing breakdown.
    For the Admin Cost Browser.
    """
    drywall_retail_price = 17.98 # CAD per sheet
    cabinet_retail_price = 349.00 # CAD per LF base
    
    inventory = [
        {
            "id": "drywall_interior",
            "name": "Install Drywall Interior Wall",
            "category": "Walls",
            "unit": "SF",
            "parts_breakdown": {
                "material_name": "1/2 in. drywall 4 ft x 8 ft",
                "retail_price": drywall_retail_price,
                "unit_cost_per_sf": drywall_retail_price / 32,
                "source": "Home Depot CA"
            },
            "installation_breakdown": {
                "labor_rate_per_unit": 1.50,
                "equipment_per_unit": 0.10,
                "waste_factor_pct": 10,
                "delivery_base": 75.0,
                "source": "DDC CWICR"
            }
        },
        {
            "id": "cabinet_replace",
            "name": "Cabinet Replacement",
            "category": "Kitchen",
            "unit": "LF",
            "parts_breakdown": {
                "material_name": "Base Cabinet 30 in.",
                "retail_price": cabinet_retail_price,
                "unit_cost_per_lf": cabinet_retail_price,
                "source": "Home Depot CA"
            },
            "installation_breakdown": {
                "labor_rate_per_unit": 95.00,
                "equipment_per_unit": 5.00,
                "waste_factor_pct": 5,
                "delivery_base": 150.0,
                "source": "RSMeans"
            }
        }
    ]
    
    return {"inventory": inventory}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
