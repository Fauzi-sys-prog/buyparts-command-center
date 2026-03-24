import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import {
  reviewPricingRecommendation,
  type PricingReviewDecision
} from "../db/repositories/pricing-review-repository.js";
import { savePricingReviewWorkspace } from "../db/repositories/pricing-review-workspace-repository.js";

type PricingRecommendationParams = {
  id: string;
};

type PricingReviewBody = {
  operatorLabel?: string | null;
  source?: string | null;
};

type SavePricingReviewWorkspaceBody = {
  checklist?: Record<string, unknown>;
  notes?: string;
  operatorLabel?: string | null;
};

async function handlePricingReview(
  reply: FastifyReply,
  recommendationId: string,
  decision: PricingReviewDecision,
  body?: PricingReviewBody
) {
  const result = await reviewPricingRecommendation(recommendationId, decision, {
    operatorLabel: body?.operatorLabel,
    source: body?.source
  });

  if (result.outcome === "not_found") {
    return reply.code(404).send({
      accepted: false,
      message: `Unknown pricing recommendation: ${recommendationId}`
    });
  }

  if (result.outcome === "already_reviewed") {
    return reply.code(409).send({
      accepted: false,
      message: `Pricing recommendation ${recommendationId} is already ${result.item.status}.`,
      item: result.item
    });
  }

  return reply.code(200).send({
    accepted: true,
    item: result.item
  });
}

export const pricingRoute: FastifyPluginAsync = async (app) => {
  app.post<{ Params: PricingRecommendationParams; Body: PricingReviewBody }>(
    "/pricing/recommendations/:id/approve",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handlePricingReview(reply, request.params.id, "approved", request.body ?? {});
    }
  );

  app.post<{ Params: PricingRecommendationParams; Body: PricingReviewBody }>(
    "/pricing/recommendations/:id/reject",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handlePricingReview(reply, request.params.id, "rejected", request.body ?? {});
    }
  );

  app.post<{ Params: PricingRecommendationParams; Body: SavePricingReviewWorkspaceBody }>(
    "/pricing/recommendations/:id/review-workspace",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      const result = await savePricingReviewWorkspace(request.params.id, request.body ?? {});

      if (result.outcome === "not_found") {
        return reply.code(404).send({
          accepted: false,
          message: `Unknown pricing recommendation: ${request.params.id}`
        });
      }

      return reply.code(200).send({
        accepted: true,
        item: result.item
      });
    }
  );
};
