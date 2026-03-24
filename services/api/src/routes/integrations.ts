import type { FastifyPluginAsync } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import { listSyncRuns } from "../db/repositories/read-model-repository.js";
import {
  getIntegrationReadinessById,
  getIntegrationReadinessCatalog
} from "../domain/integration-readiness.js";

type SyncRunQuery = {
  limit?: string;
  status?: string;
  connector?: string;
};

function clampLimit(value: string | undefined, defaultValue = 10) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

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

  app.get<{ Querystring: SyncRunQuery }>("/integrations/sync-runs", async (request, reply) => {
    const limit = clampLimit(request.query.limit, 12);

    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        total: 0,
        items: []
      };
    }

    try {
      const items = await listSyncRuns(limit, request.query.status, request.query.connector);

      return {
        mode: "live",
        total: items.length,
        items
      };
    } catch (error) {
      app.log.error(error);

      return reply.code(200).send({
        mode: "degraded",
        total: 0,
        items: [],
        reason: error instanceof Error ? error.message : "Unable to read sync runs."
      });
    }
  });
};
