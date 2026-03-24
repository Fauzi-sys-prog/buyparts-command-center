# Supplier Integration Plan

This layer prepares supplier ingestion before live supplier credentials are connected.

## Goal

Normalize supplier data into a single internal shape for:

- catalog enrichment inputs
- pricing and margin calculations
- stock and lead-time tracking

## Planned adapters

- `catalog-feed-adapter`
- `pricing-feed-adapter`
- `availability-feed-adapter`

## Current implementation state

- supplier API readiness exists
- adapter manifest exists
- sync job runs in dry-run mode until credentials are present

## Manual setup needed later

- `SUPPLIER_API_BASE_URL`
- `SUPPLIER_API_KEY`

## Next engineering step after credentials exist

1. add concrete supplier API client code
2. map supplier payloads into staging tables
3. add deduping and audit logs
4. feed normalized output into pricing and catalog pipelines
