# BuyParts Command Center

Starter monorepo for the internal BuyParts.Online operations platform. This scaffold is designed around the MVP we discussed: centralize Shopify data, expose operational APIs, and prepare worker jobs for pricing and catalog intelligence.

## Target stack alignment

This repository is intentionally aligned to the target stack from the BuyParts.Online role:

- `JavaScript / Node.js`: dashboard and operational API
- `PostgreSQL / SQL`: operational data store, sync logs, pricing rules, order and SKU data
- `Python`: autonomous jobs for pricing, inventory tagging, enrichment, and warehouse sync
- `Shopify`: primary commerce source for products, variants, inventory, and orders
- `Google BigQuery`: downstream warehouse layer for large-scale analytics and ads joins
- `AI / LLM`: catalog enrichment and recommendation generation
- `API Integration`: Shopify, suppliers, Google Ads, Merchant Center
- `RAG / LangChain`: future retrieval pipelines for manufacturer data, catalog context, and operator assist tools

## Workspace layout

- `apps/web`: Next.js dashboard shell for the Industrial Command Center UI
- `services/api`: Node.js API for health, module metadata, and future Shopify integrations
- `services/worker`: Python worker for pricing, enrichment, and scheduled jobs
- `docs`: architecture notes, module map, and rollout guidance

## Product modules

- Executive Dashboard
- SKU Intelligence
- Pricing Engine
- Inventory Control
- Catalog AI Enrichment
- Integrations Hub
- Growth & Ads
- Alerts Center
- Settings & Rules

## Getting started

1. Copy `.env.example` to `.env` and fill in credentials as they become available.
2. Start PostgreSQL locally with `docker compose up -d postgres`.
3. Install JavaScript dependencies with `npm install`.
4. Apply the API schema with `npm run db:apply`.
5. Create a Python virtual environment inside `services/worker` when we are ready to implement jobs.

## Immediate next build steps

1. Wire the web dashboard to the API module endpoints.
2. Apply [services/api/db/schema.sql](services/api/db/schema.sql) to local PostgreSQL.
3. Install dependencies and start the API to test real Shopify webhook persistence.
4. Move pricing and catalog enrichment logic into the worker with auditable job runs.

## Manual setup checkpoints

The API now exposes a readiness map for every external integration:

- `GET /integrations/readiness`
- `GET /integrations/readiness/:id`

Use that readiness view to see exactly which env vars are still missing before we wire a live provider.

## GitHub workflow

- `main`: release-ready branch
- `develop`: integration branch
- CI: `.github/workflows/ci.yml`
- delivery artifacts: `.github/workflows/delivery.yml`

See [docs/github-flow.md](docs/github-flow.md) for the branch and pull request flow.

See [docs/architecture.md](docs/architecture.md), [docs/mvp-roadmap.md](docs/mvp-roadmap.md), [docs/shopify-ingestion.md](docs/shopify-ingestion.md), [docs/stack-alignment.md](docs/stack-alignment.md), [docs/manual-setup-checklist.md](docs/manual-setup-checklist.md), [docs/bigquery-warehouse-plan.md](docs/bigquery-warehouse-plan.md), [docs/growth-channels-plan.md](docs/growth-channels-plan.md), [docs/supplier-integration-plan.md](docs/supplier-integration-plan.md), and [docs/ai-runtime-plan.md](docs/ai-runtime-plan.md) for the planning layer behind this scaffold.
