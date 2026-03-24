# BuyParts Command Center

Starter monorepo for the internal BuyParts.Online operations platform. This scaffold is designed around the MVP we discussed: centralize Shopify data, expose operational APIs, and prepare worker jobs for pricing and catalog intelligence.

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

## GitHub workflow

- `main`: release-ready branch
- `develop`: integration branch
- CI: `.github/workflows/ci.yml`
- delivery artifacts: `.github/workflows/delivery.yml`

See [docs/github-flow.md](docs/github-flow.md) for the branch and pull request flow.

See [docs/architecture.md](docs/architecture.md), [docs/mvp-roadmap.md](docs/mvp-roadmap.md), and [docs/shopify-ingestion.md](docs/shopify-ingestion.md) for the planning layer behind this scaffold.
