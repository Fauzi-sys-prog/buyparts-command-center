export function getEnv() {
  return {
    apiPort: Number(process.env.API_PORT ?? 4000),
    postgresUrl: process.env.POSTGRES_URL ?? "",
    shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
    shopifyAdminToken: process.env.SHOPIFY_ADMIN_TOKEN ?? ""
  };
}

export function isPostgresConfigured() {
  return getEnv().postgresUrl.trim().length > 0;
}
