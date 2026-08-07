---
name: estimate-validation
description: Analyzes deterministic estimates for missing scope, unrealistic quantities, duplicate items, and pricing anomalies against regional benchmarks.
---

# Estimate Validation Skill

## Inputs
- `structured_estimate` (JSON): The full estimate including line items, quantities, and applied regional factors.

## Outputs
- `is_valid` (bool)
- `anomalies` (list of dicts): E.g., `{"item": "Cabinet installation", "issue": "appears 31% above regional benchmark"}`
- `confidence_score` (float): Aggregate confidence (0.0 to 1.0).

## Validation Rules
1. **Arithmetic Check**: Re-calculate `quantity * unit_cost * regional_multiplier`. Does it match `line_total`?
2. **Missing Work**: If "Cabinets" are being installed, is "Demolition" included (unless new construction)?
3. **Outliers**: Does any line item cost deviate by > 20% from the historical/regional benchmark?
4. **Labor/Material Ratios**: Is the labor cost suspiciously low or high compared to the material cost for the given trade?

## Confidence Rules
- -0.1 for every anomaly detected.
- -0.05 for every item marked "unknown" or "derived".
- +0.1 if the property data (sqft) was fetched from a verified public source.
