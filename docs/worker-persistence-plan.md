# Worker Persistence Plan

The worker now persists the earliest backend-friendly job outputs directly into PostgreSQL.

## What is persisted now

### Pricing recommendation dry-run

- selects the most recent synced variant
- computes a placeholder recommendation from the current price
- writes a row into `pricing_recommendations`

### Catalog enrichment queue

- selects the most recent synced product
- writes a row into `catalog_enrichment_runs`
- if no LLM credentials exist yet, stores a queue record with `pending_provider_config`

## Why this matters

This gives the worker real storage and audit behavior before live AI and full pricing rule engines are wired in.

## Current requirements

- `POSTGRES_URL`
- synced Shopify product and variant data in PostgreSQL

## Next engineering step

1. add worker-side tables or events for job run history
2. connect pricing rules and margin guards into recommendation generation
3. replace placeholder enrichment planning with live provider calls once credentials exist
