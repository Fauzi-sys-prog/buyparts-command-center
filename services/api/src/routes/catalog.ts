import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import {
  reviewCatalogRun,
  type CatalogRunDecision
} from "../db/repositories/catalog-review-repository.js";

type CatalogRunParams = {
  id: string;
};

async function handleCatalogRunReview(
  reply: FastifyReply,
  runId: string,
  decision: CatalogRunDecision
) {
  const result = await reviewCatalogRun(runId, decision);

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
  app.post<{ Params: CatalogRunParams }>("/catalog/enrichment-runs/:id/queue", async (request, reply) => {
    if (!isPostgresConfigured()) {
      return reply.code(503).send({
        accepted: false,
        message: "POSTGRES_URL is not configured yet."
      });
    }

    return handleCatalogRunReview(reply, request.params.id, "queued");
  });

  app.post<{ Params: CatalogRunParams }>("/catalog/enrichment-runs/:id/cancel", async (request, reply) => {
    if (!isPostgresConfigured()) {
      return reply.code(503).send({
        accepted: false,
        message: "POSTGRES_URL is not configured yet."
      });
    }

    return handleCatalogRunReview(reply, request.params.id, "cancelled");
  });
};
