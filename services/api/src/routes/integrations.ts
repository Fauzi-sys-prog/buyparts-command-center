import type { FastifyPluginAsync } from "fastify";

import {
  getIntegrationReadinessById,
  getIntegrationReadinessCatalog
} from "../domain/integration-readiness.js";

export const integrationsRoute: FastifyPluginAsync = async (app) => {
  app.get("/integrations/readiness", async () => {
    const items = getIntegrationReadinessCatalog();

    return {
      items,
      summary: {
        total: items.length,
        configured: items.filter((item) => item.status === "configured").length,
        partiallyConfigured: items.filter((item) => item.status === "partially_configured").length,
        needsManualSetup: items.filter((item) => item.status === "needs_manual_setup").length,
        codeReady: items.filter((item) => item.status === "code_ready").length
      }
    };
  });

  app.get<{ Params: { id: string } }>("/integrations/readiness/:id", async (request, reply) => {
    const item = getIntegrationReadinessById(request.params.id);

    if (!item) {
      return reply.code(404).send({
        message: `Unknown integration readiness target: ${request.params.id}`
      });
    }

    return {
      item
    };
  });
};
