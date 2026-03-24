# BigQuery Warehouse Plan

This layer is being prepared before live Google credentials are connected.

## Goal

Move from operational PostgreSQL data into a warehouse model that supports:

- profit per SKU analytics
- inventory trend analysis
- pricing recommendation analysis
- future Google Ads and Merchant Center joins

## Planned dataset

- dataset: `buyparts`
- location: `US` by default until a production region is chosen

## Planned warehouse tables

- `dim_products`
- `dim_variants`
- `fact_orders`
- `fact_order_lines`
- `fact_inventory_snapshots`
- `fact_pricing_recommendations`
- `fact_catalog_enrichment_runs`
- `fact_google_ads_sku_daily`

## Current implementation state

- worker-side config model exists
- BigQuery readiness evaluation exists
- warehouse table manifest exists
- sync job runs in dry-run mode until credentials are present

## Manual setup needed later

- `GCP_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_LOCATION`
- `BIGQUERY_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`

## Next engineering step after credentials exist

1. add BigQuery client dependency to the worker
2. extract operational records from PostgreSQL
3. materialize load batches per warehouse table
4. write idempotent upsert/load behavior for BigQuery
