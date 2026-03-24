# Stack Alignment

This project is being shaped to match the BuyParts.Online concept and stack directly, not loosely.

## Required stack -> repo mapping

### JavaScript

- used in `apps/web` for the dashboard UI
- used in `services/api` through TypeScript on Node.js

### Node.js

- powers the operational API
- handles webhook intake, sync orchestration, and integration endpoints

### PostgreSQL

- stores products, variants, orders, sync runs, alerts, pricing rules, and recommendations
- schema lives in `services/api/db/schema.sql`

### Python

- powers worker jobs for pricing, inventory tagging, enrichment, supplier sync, and warehouse export
- worker package lives in `services/worker`

### Shopify

- primary source for product, variant, inventory, and order data
- ingestion routes live in `services/api/src/routes/shopify.ts`

### Google BigQuery

- downstream warehouse for large-scale SKU analytics and spend joins
- first worker stub lives in `services/worker/src/buyparts_worker/jobs/bigquery_sync.py`

### AI / LLM technologies

- used for title, description, spec, and attribute enrichment
- worker stub lives in `services/worker/src/buyparts_worker/jobs/catalog_enrichment.py`

### API Integration

- integration hub includes Shopify, suppliers, Google Ads, and Merchant Center
- current live slice is Shopify; others are scaffolded for expansion

### SQL

- drives operational queries in PostgreSQL today
- extends to analytical queries in BigQuery later

### RAG

- planned for manufacturer documents, supplier specs, fitment notes, and operator assistance
- worker stub lives in `services/worker/src/buyparts_worker/jobs/rag_indexing.py`

### LangChain

- planned as the orchestration layer for retrieval and multi-step AI pipelines
- worker stub lives in `services/worker/src/buyparts_worker/jobs/langchain_catalog_assistant.py`

## Concept alignment

The product concept is:

- internal command center, not storefront
- centered on profit per SKU
- data engine for pricing, inventory, catalog quality, and ad optimization
- automation-first, with human approvals where business risk matters

## What is already aligned

- Node.js API scaffold
- PostgreSQL schema
- Python worker
- Shopify ingestion with database persistence
- CI and GitHub branch flow

## What still needs to be built

- BigQuery export and warehouse models
- Google Ads and Merchant Center connectors
- supplier API normalization
- LLM enrichment pipeline with provider integration
- RAG indexing and retrieval workflow
- LangChain-driven multi-step catalog assistant flows
