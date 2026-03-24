import { getEnv, hasEnvValue } from "../config/env.js";

export type IntegrationReadinessStatus =
  | "configured"
  | "partially_configured"
  | "needs_manual_setup"
  | "code_ready";

export type IntegrationReadiness = {
  id: string;
  name: string;
  category: string;
  status: IntegrationReadinessStatus;
  summary: string;
  requiredEnv: string[];
  optionalEnv: string[];
  missingEnv: string[];
  configuredEnv: string[];
  manualSteps: string[];
};

function resolveStatus(requiredEnv: string[], missingEnv: string[], codeReady = false): IntegrationReadinessStatus {
  if (codeReady) {
    return "code_ready";
  }

  if (requiredEnv.length > 0 && missingEnv.length === 0) {
    return "configured";
  }

  if (requiredEnv.length > 0 && missingEnv.length < requiredEnv.length) {
    return "partially_configured";
  }

  return "needs_manual_setup";
}

function buildReadiness(input: {
  id: string;
  name: string;
  category: string;
  summary: string;
  requiredEnv?: string[];
  optionalEnv?: string[];
  configuredEnv?: string[];
  manualSteps: string[];
  codeReady?: boolean;
}) {
  const requiredEnv = input.requiredEnv ?? [];
  const optionalEnv = input.optionalEnv ?? [];
  const configuredEnv = input.configuredEnv ?? [];
  const missingEnv = requiredEnv.filter((key) => !configuredEnv.includes(key));

  return {
    id: input.id,
    name: input.name,
    category: input.category,
    status: resolveStatus(requiredEnv, missingEnv, input.codeReady),
    summary: input.summary,
    requiredEnv,
    optionalEnv,
    missingEnv,
    configuredEnv,
    manualSteps: input.manualSteps
  } satisfies IntegrationReadiness;
}

export function getIntegrationReadinessCatalog(): IntegrationReadiness[] {
  const env = getEnv();
  const bigqueryAuthConfigured =
    hasEnvValue(env.bigqueryServiceAccountJson) || hasEnvValue(env.googleApplicationCredentials);
  const vectorConfigured =
    hasEnvValue(env.vectorStoreProvider) &&
    hasEnvValue(env.vectorStoreUrl) &&
    hasEnvValue(env.vectorStoreApiKey);

  return [
    buildReadiness({
      id: "postgres",
      name: "PostgreSQL",
      category: "storage",
      summary: "Operational database for products, orders, sync logs, pricing rules, and approvals.",
      requiredEnv: ["POSTGRES_URL"],
      configuredEnv: hasEnvValue(env.postgresUrl) ? ["POSTGRES_URL"] : [],
      manualSteps: [
        "Create or provision a PostgreSQL database.",
        "Set POSTGRES_URL and apply the schema with npm run db:apply."
      ]
    }),
    buildReadiness({
      id: "shopify",
      name: "Shopify",
      category: "commerce",
      summary: "Primary source for product, variant, inventory, and order data.",
      requiredEnv: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_TOKEN"],
      optionalEnv: ["SHOPIFY_STOREFRONT_TOKEN"],
      configuredEnv: [
        hasEnvValue(env.shopifyStoreDomain) ? "SHOPIFY_STORE_DOMAIN" : "",
        hasEnvValue(env.shopifyAdminToken) ? "SHOPIFY_ADMIN_TOKEN" : "",
        hasEnvValue(env.shopifyStorefrontToken) ? "SHOPIFY_STOREFRONT_TOKEN" : ""
      ].filter(Boolean),
      manualSteps: [
        "Create a Shopify development store or connect the production store later.",
        "Create a custom app and copy the Admin API access token.",
        "Optionally add a Storefront token for storefront-side experiments."
      ]
    }),
    buildReadiness({
      id: "bigquery",
      name: "Google BigQuery",
      category: "warehouse",
      summary: "Warehouse layer for SKU analytics, spend joins, and long-range trend analysis.",
      requiredEnv: ["GCP_PROJECT_ID", "BIGQUERY_DATASET", "BIGQUERY_LOCATION", "BIGQUERY_AUTH"],
      configuredEnv: [
        hasEnvValue(env.gcpProjectId) ? "GCP_PROJECT_ID" : "",
        hasEnvValue(env.bigqueryDataset) ? "BIGQUERY_DATASET" : "",
        hasEnvValue(env.bigqueryLocation) ? "BIGQUERY_LOCATION" : "",
        bigqueryAuthConfigured ? "BIGQUERY_AUTH" : ""
      ].filter(Boolean),
      optionalEnv: ["BIGQUERY_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS"],
      manualSteps: [
        "Create a Google Cloud project and enable BigQuery.",
        "Create the target dataset and region.",
        "Create a service account or provide GOOGLE_APPLICATION_CREDENTIALS for warehouse jobs."
      ]
    }),
    buildReadiness({
      id: "google-ads",
      name: "Google Ads",
      category: "growth",
      summary: "Connect ad performance to SKU economics and future campaign automation.",
      requiredEnv: [
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "GOOGLE_ADS_CUSTOMER_ID",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID"
      ],
      configuredEnv: [
        hasEnvValue(env.googleAdsDeveloperToken) ? "GOOGLE_ADS_DEVELOPER_TOKEN" : "",
        hasEnvValue(env.googleAdsCustomerId) ? "GOOGLE_ADS_CUSTOMER_ID" : "",
        hasEnvValue(env.googleAdsLoginCustomerId) ? "GOOGLE_ADS_LOGIN_CUSTOMER_ID" : ""
      ].filter(Boolean),
      manualSteps: [
        "Create or use a Google Ads manager account.",
        "Request a developer token.",
        "Collect the login customer ID and target customer ID."
      ]
    }),
    buildReadiness({
      id: "merchant-center",
      name: "Merchant Center",
      category: "growth",
      summary: "Merchant feed diagnostics and downstream product feed control.",
      requiredEnv: ["GOOGLE_MERCHANT_ID", "BIGQUERY_AUTH"],
      configuredEnv: [
        hasEnvValue(env.googleMerchantId) ? "GOOGLE_MERCHANT_ID" : "",
        bigqueryAuthConfigured ? "BIGQUERY_AUTH" : ""
      ].filter(Boolean),
      optionalEnv: ["BIGQUERY_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS"],
      manualSteps: [
        "Create or access the Merchant Center account.",
        "Add a service account or OAuth credentials with access to the merchant account.",
        "Store the merchant ID and Google application credentials."
      ]
    }),
    buildReadiness({
      id: "supplier-api",
      name: "Supplier API",
      category: "supply",
      summary: "Normalize external supplier pricing, stock, and lead-time feeds.",
      requiredEnv: ["SUPPLIER_API_BASE_URL", "SUPPLIER_API_KEY"],
      configuredEnv: [
        hasEnvValue(env.supplierApiBaseUrl) ? "SUPPLIER_API_BASE_URL" : "",
        hasEnvValue(env.supplierApiKey) ? "SUPPLIER_API_KEY" : ""
      ].filter(Boolean),
      manualSteps: [
        "Obtain supplier API documentation.",
        "Request sandbox or production credentials from the supplier.",
        "Store the base URL and API key in env."
      ]
    }),
    buildReadiness({
      id: "llm",
      name: "LLM Provider",
      category: "ai",
      summary: "Catalog enrichment, recommendation language, and AI-assisted operator workflows.",
      requiredEnv: ["LLM_PROVIDER", "LLM_API_KEY"],
      optionalEnv: ["EMBEDDING_PROVIDER", "EMBEDDING_API_KEY"],
      configuredEnv: [
        hasEnvValue(env.llmProvider) ? "LLM_PROVIDER" : "",
        hasEnvValue(env.llmApiKey) ? "LLM_API_KEY" : "",
        hasEnvValue(env.embeddingProvider) ? "EMBEDDING_PROVIDER" : "",
        hasEnvValue(env.embeddingApiKey) ? "EMBEDDING_API_KEY" : ""
      ].filter(Boolean),
      manualSteps: [
        "Choose a cloud LLM provider or local model runtime.",
        "Create the API key for text generation.",
        "Add embedding credentials too if RAG will use hosted embedding models."
      ]
    }),
    buildReadiness({
      id: "rag-runtime",
      name: "RAG Runtime",
      category: "retrieval",
      summary: "Retrieval layer for manufacturer docs, specs, fitment notes, and operator assist tools.",
      requiredEnv: [
        "EMBEDDING_PROVIDER",
        "EMBEDDING_API_KEY",
        "VECTOR_STORE_PROVIDER",
        "VECTOR_STORE_URL",
        "VECTOR_STORE_API_KEY",
        "RAG_COLLECTION_NAME"
      ],
      configuredEnv: [
        hasEnvValue(env.embeddingProvider) ? "EMBEDDING_PROVIDER" : "",
        hasEnvValue(env.embeddingApiKey) ? "EMBEDDING_API_KEY" : "",
        vectorConfigured ? "VECTOR_STORE_PROVIDER" : "",
        vectorConfigured ? "VECTOR_STORE_URL" : "",
        vectorConfigured ? "VECTOR_STORE_API_KEY" : "",
        hasEnvValue(env.ragCollectionName) ? "RAG_COLLECTION_NAME" : ""
      ].filter(Boolean),
      manualSteps: [
        "Choose an embedding provider or local embedding model.",
        "Choose a vector store service or self-hosted vector database.",
        "Create the target collection/index for catalog retrieval."
      ]
    }),
    buildReadiness({
      id: "langchain",
      name: "LangChain",
      category: "orchestration",
      summary: "Library-level orchestration for multi-step enrichment and retrieval chains.",
      codeReady: true,
      optionalEnv: ["LANGCHAIN_TRACING_V2", "LANGCHAIN_API_KEY"],
      configuredEnv: [
        hasEnvValue(env.langchainTracingV2) ? "LANGCHAIN_TRACING_V2" : "",
        hasEnvValue(env.langchainApiKey) ? "LANGCHAIN_API_KEY" : ""
      ].filter(Boolean),
      manualSteps: [
        "No external account is required to use LangChain locally.",
        "Add LangSmith tracing only if you want observability for chain runs."
      ]
    })
  ];
}

export function getIntegrationReadinessById(id: string) {
  return getIntegrationReadinessCatalog().find((item) => item.id === id) ?? null;
}
