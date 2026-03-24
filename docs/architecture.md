# Architecture Overview

## Positioning

BuyParts Command Center is an internal operations and growth platform, not a customer storefront. Its job is to help the team make better decisions per SKU across catalog quality, pricing, inventory, and channel performance.

The target architecture follows the intended hiring stack:

- `Node.js` API for integrations and operational workflows
- `PostgreSQL` for transactional and operational data
- `Python` for autonomous systems and AI-heavy jobs
- `Shopify` as the commerce control plane
- `BigQuery` as the warehouse and analytics layer
- `LLM + RAG + LangChain` for enrichment, knowledge retrieval, and operator assistance
- `Google Ads` and `Merchant Center` as growth channel integrations once SKU economics are trustworthy

## Bounded contexts

### 1. Commerce ingestion

- Pull products, variants, inventory, and orders from Shopify.
- Normalize supplier payloads into a shared product model.
- Persist sync status and retry history for every upstream integration.

### 2. Operational core

- Store product mappings, SKU-level metrics, pricing rules, and automation settings in PostgreSQL.
- Expose internal APIs for dashboards, approvals, and alert handling.
- Maintain auditability for every machine-generated recommendation.

### 3. Intelligence jobs

- Run worker jobs for catalog enrichment, pricing recommendations, and inventory tagging.
- Start with scheduled batch jobs, then graduate to event-driven runs when the data flow is stable.
- Keep job outputs explainable so operators can approve or reject actions.

### 4. Analytics layer

- MVP: calculate dashboards directly from PostgreSQL.
- Phase 2: mirror high-volume facts into BigQuery for long-range analysis and attribution.
- Connect Google Ads and Merchant Center only after SKU and margin data are trustworthy.

## Suggested data flow

1. Shopify and supplier APIs push or sync source records into the API layer.
2. API normalizes and stores operational records in PostgreSQL.
3. Worker jobs read from PostgreSQL, compute recommendations, then write back proposals and logs.
4. Web dashboard surfaces current state, alerts, and operator actions.
5. BigQuery becomes the downstream analytics warehouse once the core pipeline is stable.

## Initial database domains

- `products`
- `variants`
- `sku_mappings`
- `inventory_snapshots`
- `order_lines`
- `pricing_rules`
- `pricing_recommendations`
- `catalog_enrichment_runs`
- `integration_connections`
- `sync_runs`
- `alerts`

## Build priorities

1. Stable ingestion from Shopify
2. SKU-level dashboard and operational metrics
3. Catalog enrichment workflow
4. Pricing recommendation engine
5. Supplier and ads expansion
