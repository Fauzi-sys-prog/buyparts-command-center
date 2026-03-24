import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isPostgresConfigured } from "../config/env.js";
import {
  reviewPricingRecommendation,
  type PricingReviewDecision
} from "../db/repositories/pricing-review-repository.js";

type PricingRecommendationParams = {
  id: string;
};

async function handlePricingReview(
  reply: FastifyReply,
  recommendationId: string,
  decision: PricingReviewDecision
) {
  const result = await reviewPricingRecommendation(recommendationId, decision);

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
  app.post<{ Params: PricingRecommendationParams }>(
    "/pricing/recommendations/:id/approve",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handlePricingReview(reply, request.params.id, "approved");
    }
  );

  app.post<{ Params: PricingRecommendationParams }>(
    "/pricing/recommendations/:id/reject",
    async (request, reply) => {
      if (!isPostgresConfigured()) {
        return reply.code(503).send({
          accepted: false,
          message: "POSTGRES_URL is not configured yet."
        });
      }

      return handlePricingReview(reply, request.params.id, "rejected");
    }
  );
};
