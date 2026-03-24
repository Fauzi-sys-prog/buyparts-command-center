import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import {
  reviewCatalogRun,
  type CatalogRunDecision
} from "../db/repositories/catalog-review-repository.js";
import { saveCatalogReviewWorkspace } from "../db/repositories/catalog-review-workspace-repository.js";
import { getCatalogEnrichmentRunDetail } from "../db/repositories/read-model-repository.js";

type CatalogRunParams = {
  id: string;
};

type CatalogRunDecisionBody = {
  operatorLabel?: string | null;
  source?: string | null;
};

type SaveCatalogReviewWorkspaceBody = {
  checklist?: Record<string, unknown>;
  notes?: string;
  operatorLabel?: string | null;
};

async function handleCatalogRunReview(
  reply: FastifyReply,
  runId: string,
  decision: CatalogRunDecision,
  body?: CatalogRunDecisionBody
) {
  const result = await reviewCatalogRun(runId, decision, {
    operatorLabel: body?.operatorLabel,
    source: body?.source
  });

  if (result.outcome === "not_found") {
    return reply.code(404).send({
      accepted: false,
      message: `Unknown catalog enrichment run: ${runId}`
    });
  }

  if (result.outcome === "already_finalized") {
    return reply.code(409).send({
      accepted: false,
      message: `Catalog enrichment run ${runId} is already ${result.item.status}.`,
      item: result.item
    });
  }

  return reply.code(200).send({
    accepted: true,
    item: result.item
  });
}

export const catalogRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Params: CatalogRunParams }>("/catalog/enrichment-runs/:id", async (request, reply) => {
    if (!isPostgresConfigured()) {
      return {
        mode: "preview",
        item: null,
        reason: "POSTGRES_URL is not configured yet."
      };
    }

    try {
      const item = await getCatalogEnrichmentRunDetail(request.params.id);

      if (!item) {
        return reply.code(404).send({
          mode: "live",
          item: null,
          reason: `Unknown catalog enrichment run: ${request.params.id}`
        });
      }

      return {
        mode: "live",
        item
      };
    } catch (error) {
      app.log.error(error);

      return reply.code(200).send({
        mode: "degraded",
        item: null,
        reason: error instanceof Error ? error.message : "Unable to read catalog enrichment run."
      });
    }
  });

  app.post<{ Params: CatalogRunParams; Body: CatalogRunDecisionBody }>(
    "/catalog/enrichment-runs/:id/queue",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handleCatalogRunReview(reply, request.params.id, "queued", request.body ?? {});
    }
  );

  app.post<{ Params: CatalogRunParams; Body: CatalogRunDecisionBody }>(
    "/catalog/enrichment-runs/:id/cancel",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handleCatalogRunReview(reply, request.params.id, "cancelled", request.body ?? {});
    }
  );

  app.post<{ Params: CatalogRunParams; Body: SaveCatalogReviewWorkspaceBody }>(
    "/catalog/enrichment-runs/:id/review-workspace",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      const result = await saveCatalogReviewWorkspace(request.params.id, request.body ?? {});

      if (result.outcome === "not_found") {
        return reply.code(404).send({
          accepted: false,
          message: `Unknown catalog enrichment run: ${request.params.id}`
        });
      }

      return reply.code(200).send({
        accepted: true,
        item: result.item
      });
    }
  );
};
