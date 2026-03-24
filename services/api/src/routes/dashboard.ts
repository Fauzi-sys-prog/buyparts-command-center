import type { FastifyPluginAsync } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import {
  getDashboardReadModel,
  listAlerts,
  listCatalogEnrichmentRuns,
  listPricingRecommendations,
  listSkuOverview
} from "../db/repositories/read-model-repository.js";
import { getIntegrationReadinessCatalog } from "../domain/integration-readiness.js";

type ListQuery = {
  limit?: string;
  status?: string;
};

function clampLimit(value: string | undefined, defaultValue = 10) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

function buildIntegrationSummary() {
  const items = getIntegrationReadinessCatalog();

  return {
    total: items.length,
    configured: items.filter((item) => item.status === "configured").length,
    partiallyConfigured: items.filter((item) => item.status === "partially_configured").length,
    needsManualSetup: items.filter((item) => item.status === "needs_manual_setup").length,
    codeReady: items.filter((item) => item.status === "code_ready").length
  };
}

function buildEmptyDashboardResponse(mode: "preview" | "degraded", reason?: string) {
  return {
    mode,
    generatedAt: new Date().toISOString(),
    metrics: {
      trackedProducts: 0,
      trackedVariants: 0,
      totalOrders: 0,
      openAlerts: 0,
      pendingPricingRecommendations: 0,
      pendingCatalogEnrichmentRuns: 0
    },
    syncHealth: {
      totalRunsLast24h: 0,
      successfulRunsLast24h: 0,
      successRateLast24h: null,
      lastSyncAt: null
    },
    recentPricingRecommendations: [],
    recentCatalogEnrichmentRuns: [],
    recentAlerts: [],
    recentSyncRuns: [],
    integrationSummary: buildIntegrationSummary(),
    reason
  };
}

export const dashboardRoute: FastifyPluginAsync = async (app) => {
  app.get("/dashboard/summary", async (_request, reply) => {
    if (!isPostgresConfigured()) {
      return buildEmptyDashboardResponse("preview", "POSTGRES_URL is not configured yet.");
    }

    try {
      const summary = await getDashboardReadModel();

      return {
        mode: "live",
        ...summary,
        integrationSummary: buildIntegrationSummary()
      };
    } catch (error) {
      app.log.error(error);

      return reply.code(200).send(
        buildEmptyDashboardResponse(
          "degraded",
          error instanceof Error ? error.message : "Unable to read dashboard summary."
        )
      );
    }
  });

  app.get<{ Querystring: ListQuery }>("/pricing/recommendations", async (request, reply) => {
    const limit = clampLimit(request.query.limit, 12);

    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        total: 0,
        items: []
      };
    }

    try {
      const items = await listPricingRecommendations(limit, request.query.status);

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
        reason: error instanceof Error ? error.message : "Unable to read pricing recommendations."
      });
    }
  });

  app.get<{ Querystring: ListQuery }>("/catalog/enrichment-runs", async (request, reply) => {
    const limit = clampLimit(request.query.limit, 12);

    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        total: 0,
        items: []
      };
    }

    try {
      const items = await listCatalogEnrichmentRuns(limit, request.query.status);

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
        reason: error instanceof Error ? error.message : "Unable to read catalog enrichment runs."
      });
    }
  });

  app.get<{ Querystring: ListQuery }>("/alerts", async (request, reply) => {
    const limit = clampLimit(request.query.limit, 12);

    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        total: 0,
        items: []
      };
    }

    try {
      const items = await listAlerts(limit, request.query.status);

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
        reason: error instanceof Error ? error.message : "Unable to read alerts."
      });
    }
  });

  app.get<{ Querystring: ListQuery }>("/sku/overview", async (request, reply) => {
    const limit = clampLimit(request.query.limit, 12);

    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        total: 0,
        items: []
      };
    }

    try {
      const items = await listSkuOverview(limit);

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
        reason: error instanceof Error ? error.message : "Unable to read SKU overview."
      });
    }
  });
};
