import datetime

def get_retail_price(product_sku: str, store_id: str = "7082") -> dict:
    """
    Mock adapter for Home Depot Canada.
    In a real implementation, this would call the SerpApi or Browsable Home Depot API.
    """
    # Simulated retail pricing based on current Canadian market (CAD)
    prices = {
        "DRYWALL_1_2": 17.98,
        "CABINET_BASE_30": 349.00,
        "QUARTZ_COUNTERTOP_SQFT": 65.00
    }
    
    return {
        "source": "home_depot_ca",
        "product_id": product_sku,
        "sku": product_sku,
        "name": f"Mock Product {product_sku}",
        "category": "building_materials",
        "unit": "each",
        "price": prices.get(product_sku, 99.99),
        "currency": "CAD",
        "store": store_id,
        "postal_code": "M5V",
        "availability": "in_stock",
        "timestamp": datetime.datetime.now().isoformat()
    }
