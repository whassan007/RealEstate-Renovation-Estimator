---
name: construction-pricing
description: Provide current, location-aware material, labour, equipment, and installed-cost estimates for residential construction and renovation projects.
---
# Construction Pricing Skill

## Purpose

Provide current, location-aware material, labour, equipment,
and installed-cost estimates for residential construction
and renovation projects.

## Pricing hierarchy

1. Current local retailer price
2. Current supplier/contractor price
3. DDC CWICR work-item pricing
4. RSMeans localized unit cost
5. Historical project data
6. Regional benchmark
7. Generic national estimate

Never silently substitute a lower-confidence source.

## Material pricing

For consumer-purchasable materials, prefer:

1. Home Depot Canada
2. RONA Canada
3. Walmart Canada
4. Other local suppliers

Prices must be associated with:

- retailer
- SKU/product ID
- location/store
- currency
- timestamp
- availability
- unit of measure

Never treat a national online price as a guaranteed
local installed price.

## Labour pricing

Use DDC CWICR for open-source construction work-item
and labour data.

Use RSMeans where licensed data is available.

Labour must be represented as:

- trade
- unit
- productivity
- labour hours
- hourly rate
- crew composition
- region
- source
- timestamp

Never estimate labour by simply applying an arbitrary
percentage to material cost when unit labour data exists.

## Quantity takeoff

Convert project scope into measurable quantities:

- square feet
- linear feet
- cubic yards
- each
- sheets
- boards
- gallons
- fixtures
- labour hours

Apply explicit waste factors.

Never hide waste inside the unit price.

## Location

Pricing must use:

- country
- province/state
- city
- postal/ZIP code
- selected retailer/store

If location is unavailable, return a regional estimate
and explicitly lower confidence.

## Estimate confidence

Every estimate must include:

- low
- expected
- high
- confidence
- price timestamp
- source coverage

Example:

LOW: $18,400
EXPECTED: $22,700
HIGH: $28,900
CONFIDENCE: 78%

## Source attribution

Every material and labour price must retain its source.

Never fabricate a current price.

Never present a benchmark as a live retail price.

## Retailer price normalization

Normalize:

- CAD/USD
- per item
- per box
- per sheet
- per linear foot
- per square foot
- per cubic yard
- per gallon
- per labour hour

The estimator must convert all prices into a canonical
unit before calculating the estimate.

## Product matching

When matching retailer products to construction work:

1. Match category
2. Match specification
3. Match dimensions
4. Match material
5. Match grade
6. Match quantity/package size
7. Match brand only when relevant

Do not select a product merely because its name is similar.

## Renovation estimate

Calculate:

Material
+ Labour
+ Equipment
+ Waste
+ Delivery
+ Disposal
+ Permit
+ Subcontractor costs
+ General conditions
+ Contractor overhead
+ Contractor profit

Keep each component separately visible.

## Auditability

Every estimate line must be traceable to:

scope
→ quantity
→ product/work item
→ unit price
→ labour
→ source
→ timestamp
→ calculation
