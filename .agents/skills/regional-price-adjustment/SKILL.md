---
name: regional-price-adjustment
description: Applies structured geographic multipliers (Material, Labor, Equipment) to base construction costs based on ZIP, City, or MSA.
---

# Regional Price Adjustment Skill

## Inputs
- `base_material_cost` (float)
- `base_labor_cost` (float)
- `location` (str): e.g., "San Jose, CA"

## Outputs
- `adjusted_material_cost` (float)
- `adjusted_labor_cost` (float)
- `regional_factor_applied` (dict)

## Data Sources
- `regional_adjustments` table in Postgres.
- Local configuration factors (Complexity Factor, Access Factor, Existing-Condition Factor).

## Calculation Rules
1. `adjusted_material_cost = base_material_cost * material_multiplier * complexity_factor`
2. `adjusted_labor_cost = base_labor_cost * labor_multiplier * access_factor`

## Validation Rules
- The regional multiplier must not be zero.
- If the exact region is not found, fallback to the State average, then National average, and decrease `confidence`.
- Every adjustment must be explainable in the output schema.
