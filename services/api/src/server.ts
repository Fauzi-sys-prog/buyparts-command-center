import Fastify from "fastify";

import { catalogRoute } from "./routes/catalog.js";
import { dashboardRoute } from "./routes/dashboard.js";
import { integrationsRoute } from "./routes/integrations.js";
import { healthRoute } from "./routes/health.js";
import { modulesRoute } from "./routes/modules.js";
import { pricingRoute } from "./routes/pricing.js";
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
        "/sku/variants/:externalVariantId",
        "/pricing/recommendations",
        "/pricing/recommendations/:id/approve",
        "/pricing/recommendations/:id/reject",
        "/catalog/enrichment-runs",
        "/catalog/enrichment-runs/:id/queue",
        "/catalog/enrichment-runs/:id/cancel",
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
  app.register(catalogRoute);
  app.register(integrationsRoute);
  app.register(pricingRoute);
  app.register(shopifyRoute);

  return app;
}
