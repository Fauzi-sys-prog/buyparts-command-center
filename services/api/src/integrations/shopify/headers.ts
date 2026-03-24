import type { FastifyRequest } from "fastify";

export type ShopifyWebhookMeta = {
  webhookId: string | null;
  topic: string;
  shopDomain: string | null;
};

function readHeader(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === "string" ? value : null;
}

export function getShopifyWebhookMeta(request: FastifyRequest, fallbackTopic: string): ShopifyWebhookMeta {
  return {
    webhookId: readHeader(request.headers["x-shopify-webhook-id"]),
    topic: readHeader(request.headers["x-shopify-topic"]) ?? fallbackTopic,
    shopDomain: readHeader(request.headers["x-shopify-shop-domain"])
  };
}
