# Growth Channels Plan

This layer prepares the Google Ads and Merchant Center side of the BuyParts growth engine before live credentials are connected.

## Goal

Join ad spend and merchant feed quality to SKU-level economics so the business can prioritize:

- profitable inventory
- underfunded winners
- wasteful spend
- feed issues blocking scale

## Planned Google Ads exports

- `campaign_daily_performance`
- `product_group_daily_performance`
- `search_term_daily_performance`

## Planned Merchant Center diagnostics

- `product_status_diagnostics`
- `feed_quality_summary`

## Current implementation state

- worker-side Google Ads readiness exists
- worker-side Merchant Center readiness exists
- growth export manifest exists
- both jobs run in dry-run mode until credentials are present

## Manual setup needed later

### Google Ads

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- auth via either:
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - or `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`

### Merchant Center

- `GOOGLE_MERCHANT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` or `BIGQUERY_SERVICE_ACCOUNT_JSON`

## Next engineering step after credentials exist

1. add the Google Ads and Merchant client libraries or REST clients
2. fetch campaign, product group, and feed diagnostics data
3. map external entities back to SKU and catalog references
4. publish analytical facts into PostgreSQL or BigQuery for downstream optimization
