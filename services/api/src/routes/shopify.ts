import type { FastifyPluginAsync } from "fastify";

import { withTransaction } from "../db/client.js";
import { ShopifyIngestionRepository } from "../db/repositories/shopify-ingestion-repository.js";
import { getShopifyWebhookMeta } from "../integrations/shopify/headers.js";
import {
  getShopifyConnectionStatus,
  normalizeShopifyOrderPayload,
  normalizeShopifyProductPayload
} from "../integrations/shopify/normalize.js";

export const shopifyRoute: FastifyPluginAsync = async (app) => {
  app.get("/integrations/shopify/status", async () => {
    return {
      connector: "shopify",
      status: getShopifyConnectionStatus(),
      endpoints: [
        "/integrations/shopify/status",
        "/integrations/shopify/webhooks/products-upsert",
        "/integrations/shopify/webhooks/orders-create"
      ]
    };
  });

  app.post<{ Body: unknown }>("/integrations/shopify/webhooks/products-upsert", async (request, reply) => {
    const normalized = normalizeShopifyProductPayload(request.body);

    if (!normalized.ok) {
      return reply.code(400).send({
        accepted: false,
        error: normalized.error
      });
    }

    const connectionStatus = getShopifyConnectionStatus();
    const webhookMeta = getShopifyWebhookMeta(request, "products/update");

    if (!connectionStatus.warehouseConfigured) {
      return reply.code(202).send({
        accepted: true,
        mode: "preview",
        resource: "product",
        summary: {
          products: 1,
          variants: normalized.data.variants.length,
          inventorySnapshots: normalized.data.inventorySnapshots.length
        },
        normalized: normalized.data
      });
    }

    try {
      const persisted = await withTransaction(async (client) => {
        const repository = new ShopifyIngestionRepository(client);
        return repository.persistProductIngestion(normalized.data, request.body, webhookMeta);
      });

      return reply.code(202).send({
        accepted: true,
        mode: "persisted",
        resource: "product",
        summary: {
          products: 1,
          variants: normalized.data.variants.length,
          inventorySnapshots: normalized.data.inventorySnapshots.length
        },
        persisted
      });
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        accepted: false,
        resource: "product",
        error: error instanceof Error ? error.message : "Unknown Shopify product persistence failure"
      });
    }
  });

  app.post<{ Body: unknown }>("/integrations/shopify/webhooks/orders-create", async (request, reply) => {
    const normalized = normalizeShopifyOrderPayload(request.body);

    if (!normalized.ok) {
      return reply.code(400).send({
        accepted: false,
        error: normalized.error
      });
    }

    const connectionStatus = getShopifyConnectionStatus();
    const webhookMeta = getShopifyWebhookMeta(request, "orders/create");

    if (!connectionStatus.warehouseConfigured) {
      return reply.code(202).send({
        accepted: true,
        mode: "preview",
        resource: "order",
        summary: {
          orders: 1,
          orderLines: normalized.data.orderLines.length
        },
        normalized: normalized.data
      });
    }

    try {
      const persisted = await withTransaction(async (client) => {
        const repository = new ShopifyIngestionRepository(client);
        return repository.persistOrderIngestion(normalized.data, request.body, webhookMeta);
      });

      return reply.code(202).send({
        accepted: true,
        mode: "persisted",
        resource: "order",
        summary: {
          orders: 1,
          orderLines: normalized.data.orderLines.length
        },
        persisted
      });
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        accepted: false,
        resource: "order",
        error: error instanceof Error ? error.message : "Unknown Shopify order persistence failure"
      });
    }
  });
};
