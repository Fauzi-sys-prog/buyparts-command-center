# BuyParts Command Center

Monorepo for the internal BuyParts.Online operations platform. This repo is no longer just a starter scaffold: it now includes a working local MVP with an executive dashboard, SKU detail flow, catalog review flow, pricing review actions, operator activity feed, and PostgreSQL-backed read models.

Current product position:

- Internal command center for pricing, catalog, inventory, and integrations
- Built to align with the BuyParts.Online "Brain" concept from the target role
- No customer storefront in this repo
- No login required yet for the MVP; operator identity is stored locally in the browser

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

- `apps/web`: Next.js internal dashboard and review surfaces
- `services/api`: Node.js API, Shopify ingestion routes, read models, and review actions
- `services/worker`: Python worker scaffolding for pricing, enrichment, BigQuery, Google Ads, supplier sync, and RAG
- `docs`: architecture notes, rollout guidance, and setup plans

## MVP surfaces

- Executive Dashboard
- SKU Intelligence
- Pricing Engine
- Inventory Control
- Catalog AI Enrichment
- Integrations Hub
- Growth & Ads
- Alerts Center
- Settings & Rules

## What already works locally

- Shopify webhook ingestion persists products, variants, orders, sync runs, and receipts into PostgreSQL
- Dashboard reads live summary data from the API
- Pricing recommendations can be approved or rejected
- Catalog enrichment runs can be queued or cancelled
- SKU detail pages show order, inventory, pricing, and catalog history
- Catalog review pages support notes, checklist state, and review activity
- Operator activity shows up across dashboard and module surfaces
- Integration readiness endpoints show which external providers still need manual setup

## Getting started locally

1. Copy `.env.example` to `.env` and fill in credentials as they become available.
2. Start PostgreSQL locally with `docker compose up -d postgres`.
3. Install JavaScript dependencies with `npm install`.
4. Apply the API schema with `npm run db:apply`.
5. Start the API:
   `API_PORT=4005 POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/buyparts npm --workspace @buyparts/api run start`
6. Start the web app:
   `PORT=3005 API_BASE_URL=http://127.0.0.1:4005 npm --workspace @buyparts/web run start`

Open:

- Dashboard: `http://localhost:3005`
- Pricing module: `http://localhost:3005/modules/pricing-engine`
- Catalog module: `http://localhost:3005/modules/catalog-ai`
- Demo SKU: `http://localhost:3005/sku/4123456789012`
- Demo catalog review: `http://localhost:3005/catalog/runs/59570234-6c1a-4317-b40a-310ee3a85101`

## Demo flow

Suggested recruiter or demo flow:

1. Open the Executive Dashboard and show the command-center overview.
2. Open the Pricing Engine queue and approve/reject seeded recommendations.
3. Open a live SKU detail page and walk through decision history.
4. Open a catalog review run and show review notes, checklist, and payload context.
5. Open Settings/Readiness to explain what is already scaffolded vs. what still needs provider credentials.

See [docs/demo-walkthrough.md](docs/demo-walkthrough.md) for a more detailed walkthrough.

## What still needs live credentials

The API already exposes a readiness map for every external integration:

- `GET /integrations/readiness`
- `GET /integrations/readiness/:id`

The main integrations that still require manual setup are:

- `Shopify`
- `Google BigQuery / Google Cloud`
- `Google Ads`
- `Google Merchant Center`
- `LLM provider`
- `Supplier API`
- `RAG / embeddings / vector store`

Use the readiness view or [docs/manual-setup-checklist.md](docs/manual-setup-checklist.md) to see exactly which env vars are still missing before wiring a live provider.

## GitHub workflow

- `main`: release-ready branch
- `develop`: integration branch
- CI: `.github/workflows/ci.yml`
- delivery artifacts: `.github/workflows/delivery.yml`

See [docs/github-flow.md](docs/github-flow.md) for the branch and pull request flow.

See [docs/architecture.md](docs/architecture.md), [docs/mvp-roadmap.md](docs/mvp-roadmap.md), [docs/shopify-ingestion.md](docs/shopify-ingestion.md), [docs/stack-alignment.md](docs/stack-alignment.md), [docs/manual-setup-checklist.md](docs/manual-setup-checklist.md), [docs/bigquery-warehouse-plan.md](docs/bigquery-warehouse-plan.md), [docs/growth-channels-plan.md](docs/growth-channels-plan.md), [docs/supplier-integration-plan.md](docs/supplier-integration-plan.md), [docs/ai-runtime-plan.md](docs/ai-runtime-plan.md), [docs/worker-persistence-plan.md](docs/worker-persistence-plan.md), and [docs/demo-walkthrough.md](docs/demo-walkthrough.md) for the planning and demo layer behind this repo.
