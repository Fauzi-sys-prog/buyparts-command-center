# Demo Walkthrough

This walkthrough is designed for local demos, recruiter reviews, and quick architecture tours.

## Goal

Show that the app already behaves like an internal BuyParts command center:

- executive dashboard
- live operational queues
- SKU-level decision views
- catalog review workflow
- PostgreSQL-backed activity and review state
- clear path to live provider integrations

## Start locally

1. Start PostgreSQL:
   `docker compose up -d postgres`
2. Apply schema:
   `npm run db:apply`
3. Start API:
   `API_PORT=4005 POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/buyparts npm --workspace @buyparts/api run start`
4. Start web:
   `PORT=3005 API_BASE_URL=http://127.0.0.1:4005 npm --workspace @buyparts/web run start`

## Recommended route order

1. Dashboard  
   `http://localhost:3005`

   Show:
   - executive summary cards
   - system snapshot
   - quick links
   - pricing queue
   - catalog queue
   - operator activity
   - platform readiness

2. Pricing Engine  
   `http://localhost:3005/modules/pricing-engine`

   Show:
   - queue filters
   - bulk actions
   - approval/rejection flow
   - operator-oriented review layout

3. Live SKU Detail  
   `http://localhost:3005/sku/4123456789012`

   Show:
   - current SKU profile
   - order history
   - inventory snapshots
   - pricing history
   - decision trail
   - linked catalog history

4. Catalog Review  
   `http://localhost:3005/catalog/runs/59570234-6c1a-4317-b40a-310ee3a85101`

   Show:
   - before/after comparison
   - operator checklist and notes
   - review activity
   - payload context
   - queue/cancel run controls

5. Readiness / Settings  
   `http://localhost:3005/modules/settings`

   Show:
   - what is already scaffolded
   - what still needs credentials
   - how the live rollout would proceed

## Key message for demos

This repo is intentionally positioned as the internal "Brain" behind BuyParts.Online:

- not the customer storefront
- not a generic admin shell
- a growth and operations control center for SKU-level decisions

## What is real vs. scaffolded

Already working locally:

- PostgreSQL-backed read models
- Shopify ingestion persistence
- pricing review actions
- catalog review actions
- operator activity feed
- review workspaces and notes
- internal dashboard surfaces

Still scaffolded until credentials are provided:

- Shopify live Admin API access
- BigQuery live export
- Google Ads live integration
- Merchant Center live integration
- LLM provider runtime
- supplier live API sync
- RAG live embedding/vector flow
