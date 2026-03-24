import Fastify from "fastify";

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
      endpoints: ["/health", "/modules", "/integrations/shopify/status"]
    };
  });

  app.register(healthRoute);
  app.register(modulesRoute);
  app.register(shopifyRoute);

  return app;
}
