---
name: construction-cost-retrieval
description: Retrieves unit costs for construction work items and resources from normalized reference databases (e.g., OpenConstructionEstimate).
---

# Construction Cost Retrieval Skill

## Inputs
- `work_item_description` (str): e.g., "Install kitchen cabinets"
- `category` (str, optional): Material, Labor, Equipment

## Outputs
- `unit` (str)
- `base_cost` (float)
- `source` (str)
- `confidence` (float)

## Data Sources
- `construction_data` Postgres database (`work_items` and `resources` tables)
- Qdrant Vector DB for semantic matching of ambiguous `work_item_description`

## Retrieval Strategy
1. Attempt exact match on `cost_code` if provided.
2. If no exact match, convert `work_item_description` to embeddings via DGX Spark local model.
3. Query Qdrant for top 3 semantic matches.
4. Select the highest confidence match above threshold (0.80).

## Exception Handling
- If no match > 0.80, return `cost=0` and flag `confidence="unknown"`.
- Do not let the LLM hallucinate or guess a price. 
