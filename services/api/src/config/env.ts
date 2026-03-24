export function getEnv() {
  return {
    apiPort: Number(process.env.API_PORT ?? 4000),
    postgresUrl: process.env.POSTGRES_URL ?? "",
    shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
    shopifyAdminToken: process.env.SHOPIFY_ADMIN_TOKEN ?? "",
    shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
    gcpProjectId: process.env.GCP_PROJECT_ID ?? "",
    bigqueryDataset: process.env.BIGQUERY_DATASET ?? "",
    bigqueryLocation: process.env.BIGQUERY_LOCATION ?? "",
    bigqueryServiceAccountJson: process.env.BIGQUERY_SERVICE_ACCOUNT_JSON ?? "",
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
    googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
    googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID ?? "",
    googleAdsLoginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ?? "",
    googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID ?? "",
    googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET ?? "",
    googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? "",
    googleMerchantId: process.env.GOOGLE_MERCHANT_ID ?? "",
    supplierApiBaseUrl: process.env.SUPPLIER_API_BASE_URL ?? "",
    supplierApiKey: process.env.SUPPLIER_API_KEY ?? "",
    llmProvider: process.env.LLM_PROVIDER ?? "",
    llmApiKey: process.env.LLM_API_KEY ?? "",
    embeddingProvider: process.env.EMBEDDING_PROVIDER ?? "",
    embeddingApiKey: process.env.EMBEDDING_API_KEY ?? "",
    vectorStoreProvider: process.env.VECTOR_STORE_PROVIDER ?? "",
    vectorStoreUrl: process.env.VECTOR_STORE_URL ?? "",
    vectorStoreApiKey: process.env.VECTOR_STORE_API_KEY ?? "",
    ragCollectionName: process.env.RAG_COLLECTION_NAME ?? "",
    langchainTracingV2: process.env.LANGCHAIN_TRACING_V2 ?? "",
    langchainApiKey: process.env.LANGCHAIN_API_KEY ?? ""
  };
}

export function isPostgresConfigured() {
  return getEnv().postgresUrl.trim().length > 0;
}

export function hasEnvValue(value: string) {
  return value.trim().length > 0;
}
