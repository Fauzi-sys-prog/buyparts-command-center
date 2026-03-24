import Fastify from "fastify";

import { dashboardRoute } from "./routes/dashboard.js";
import { integrationsRoute } from "./routes/integrations.js";
import { healthRoute } from "./routes/health.js";
import { modulesRoute } from "./routes/modules.js";
import { shopifyRoute } from "./routes/shopify.js";

export function buildServer() {
  const app = Fastify({
    logger: true
  });

  app.get("/", async () => {
    return {
      service: "BuyParts Command Center API",
      version: "0.1.0",
      endpoints: [
        "/health",
        "/modules",
        "/dashboard/summary",
        "/sku/overview",
        "/pricing/recommendations",
        "/catalog/enrichment-runs",
        "/alerts",
        "/integrations/readiness",
        "/integrations/sync-runs",
        "/integrations/shopify/status"
      ]
    };
  });

  app.register(healthRoute);
  app.register(modulesRoute);
  app.register(dashboardRoute);
  app.register(integrationsRoute);
  app.register(shopifyRoute);

  return app;
}
