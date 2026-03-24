# Manual Setup Checklist

This is the short list of platforms that will require manual signup or credential collection before we can finish the full BuyParts stack.

## Needed later

### Shopify

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_TOKEN`
- optional `SHOPIFY_STOREFRONT_TOKEN`

### Google Cloud / BigQuery

- `GCP_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_LOCATION`
- `BIGQUERY_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`

### Google Ads

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- either `GOOGLE_APPLICATION_CREDENTIALS` or:
  - `GOOGLE_ADS_CLIENT_ID`
  - `GOOGLE_ADS_CLIENT_SECRET`
  - `GOOGLE_ADS_REFRESH_TOKEN`

### Google Merchant Center

- `GOOGLE_MERCHANT_ID`
- Google application credentials or service account JSON with merchant access

### LLM provider

- `LLM_PROVIDER`
- `LLM_API_KEY`

### Embeddings and vector store for RAG

- `EMBEDDING_PROVIDER`
- `EMBEDDING_API_KEY`
- `VECTOR_STORE_PROVIDER`
- `VECTOR_STORE_URL`
- `VECTOR_STORE_API_KEY`
- `RAG_COLLECTION_NAME`

### Supplier API

- `SUPPLIER_API_BASE_URL`
- `SUPPLIER_API_KEY`

## No manual account required by default

- `JavaScript`
- `Node.js`
- `PostgreSQL`
- `Python`
- `SQL`
- `LangChain` as a library

## How we will use this

As we implement each live connector, we can check `GET /integrations/readiness` to confirm whether the required credentials are already present or whether we should pause and ask for manual setup.
