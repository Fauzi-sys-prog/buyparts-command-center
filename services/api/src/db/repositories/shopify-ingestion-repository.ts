import type { PoolClient } from "pg";

import type {
  NormalizedInventorySnapshotRecord,
  NormalizedOrderLineRecord,
  NormalizedOrderRecord,
  NormalizedProductRecord,
  NormalizedVariantRecord,
  OrderIngestionPreview,
  ProductIngestionPreview
} from "../../integrations/shopify/normalize.js";

type SyncRunStatus = "processing" | "success" | "failed";

type ShopifyWebhookMeta = {
  webhookId: string | null;
  topic: string;
  shopDomain: string | null;
};

type ProductPersistenceResult = {
  syncRunId: string;
  productId: string;
  variantIds: string[];
  inventorySnapshotIds: string[];
};

type OrderPersistenceResult = {
  syncRunId: string;
  orderId: string;
  orderLineIds: string[];
};

export class ShopifyIngestionRepository {
  constructor(private readonly client: Pick<PoolClient, "query">) {}

  async recordWebhookReceipt(meta: ShopifyWebhookMeta, payload: unknown) {
    await this.client.query(
      `
        INSERT INTO shopify_webhook_receipts (webhook_id, topic, shop_domain, status, payload)
        VALUES ($1, $2, $3, 'received', $4::jsonb)
        ON CONFLICT (webhook_id) DO UPDATE
        SET
          topic = EXCLUDED.topic,
          shop_domain = EXCLUDED.shop_domain,
          payload = EXCLUDED.payload
      `,
      [meta.webhookId, meta.topic, meta.shopDomain, JSON.stringify(payload)]
    );
  }

  async createSyncRun(resourceType: string, triggerType: string, externalReference: string | null, payload: unknown) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO sync_runs (
          connector,
          resource_type,
          trigger_type,
          status,
          external_reference,
          records_received,
          payload
        )
        VALUES ('shopify', $1, $2, 'processing', $3, 1, $4::jsonb)
        RETURNING id
      `,
      [resourceType, triggerType, externalReference, JSON.stringify(payload)]
    );

    return result.rows[0].id;
  }

  async updateSyncRun(syncRunId: string, status: SyncRunStatus, errorMessage?: string | null) {
    await this.client.query(
      `
        UPDATE sync_runs
        SET status = $2,
            error_message = $3,
            finished_at = NOW()
        WHERE id = $1
      `,
      [syncRunId, status, errorMessage ?? null]
    );
  }

  async updateWebhookReceipt(webhookId: string | null, status: "processed" | "failed") {
    if (!webhookId) {
      return;
    }

    await this.client.query(
      `
        UPDATE shopify_webhook_receipts
        SET status = $2,
            processed_at = NOW()
        WHERE webhook_id = $1
      `,
      [webhookId, status]
    );
  }

  async persistProductIngestion(
    preview: ProductIngestionPreview,
    payload: unknown,
    meta: ShopifyWebhookMeta
  ): Promise<ProductPersistenceResult> {
    await this.recordWebhookReceipt(meta, payload);
    const syncRunId = await this.createSyncRun(
      "products",
      "webhook",
      preview.product.externalProductId,
      payload
    );

    try {
      const productId = await this.upsertProduct(preview.product);
      const variantIds: string[] = [];
      const inventorySnapshotIds: string[] = [];

      for (const variant of preview.variants) {
        const variantId = await this.upsertVariant(productId, variant);
        variantIds.push(variantId);
      }

      for (const [index, snapshot] of preview.inventorySnapshots.entries()) {
        const matchingVariantId = variantIds[index] ?? null;

        if (!matchingVariantId) {
          continue;
        }

        const snapshotId = await this.insertInventorySnapshot(matchingVariantId, snapshot);
        inventorySnapshotIds.push(snapshotId);
      }

      await this.updateSyncRun(syncRunId, "success");
      await this.updateWebhookReceipt(meta.webhookId, "processed");

      return {
        syncRunId,
        productId,
        variantIds,
        inventorySnapshotIds
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown product ingestion failure";
      await this.updateSyncRun(syncRunId, "failed", message);
      await this.updateWebhookReceipt(meta.webhookId, "failed");
      throw error;
    }
  }

  async persistOrderIngestion(
    preview: OrderIngestionPreview,
    payload: unknown,
    meta: ShopifyWebhookMeta
  ): Promise<OrderPersistenceResult> {
    await this.recordWebhookReceipt(meta, payload);
    const syncRunId = await this.createSyncRun(
      "orders",
      "webhook",
      preview.order.externalOrderId,
      payload
    );

    try {
      const orderId = await this.upsertOrder(preview.order);
      const orderLineIds: string[] = [];

      for (const line of preview.orderLines) {
        const orderLineId = await this.upsertOrderLine(orderId, line);
        orderLineIds.push(orderLineId);
      }

      await this.updateSyncRun(syncRunId, "success");
      await this.updateWebhookReceipt(meta.webhookId, "processed");

      return {
        syncRunId,
        orderId,
        orderLineIds
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown order ingestion failure";
      await this.updateSyncRun(syncRunId, "failed", message);
      await this.updateWebhookReceipt(meta.webhookId, "failed");
      throw error;
    }
  }

  private async upsertProduct(product: NormalizedProductRecord) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO products (
          external_product_id,
          title,
          handle,
          vendor,
          product_type,
          status,
          tags,
          source_payload,
          synced_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW(), NOW())
        ON CONFLICT (external_product_id) DO UPDATE
        SET title = EXCLUDED.title,
            handle = EXCLUDED.handle,
            vendor = EXCLUDED.vendor,
            product_type = EXCLUDED.product_type,
            status = EXCLUDED.status,
            tags = EXCLUDED.tags,
            source_payload = EXCLUDED.source_payload,
            synced_at = NOW(),
            updated_at = NOW()
        RETURNING id
      `,
      [
        product.externalProductId,
        product.title,
        product.handle,
        product.vendor,
        product.productType,
        product.status,
        JSON.stringify(product.tags),
        JSON.stringify(product.sourcePayload)
      ]
    );

    return result.rows[0].id;
  }

  private async upsertVariant(productId: string, variant: NormalizedVariantRecord) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO variants (
          product_id,
          external_variant_id,
          external_inventory_item_id,
          sku,
          barcode,
          title,
          price,
          compare_at_price,
          taxable,
          tracked,
          inventory_policy,
          option_values,
          source_payload,
          synced_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, NOW(), NOW())
        ON CONFLICT (external_variant_id) DO UPDATE
        SET product_id = EXCLUDED.product_id,
            external_inventory_item_id = EXCLUDED.external_inventory_item_id,
            sku = EXCLUDED.sku,
            barcode = EXCLUDED.barcode,
            title = EXCLUDED.title,
            price = EXCLUDED.price,
            compare_at_price = EXCLUDED.compare_at_price,
            taxable = EXCLUDED.taxable,
            tracked = EXCLUDED.tracked,
            inventory_policy = EXCLUDED.inventory_policy,
            option_values = EXCLUDED.option_values,
            source_payload = EXCLUDED.source_payload,
            synced_at = NOW(),
            updated_at = NOW()
        RETURNING id
      `,
      [
        productId,
        variant.externalVariantId,
        variant.externalInventoryItemId,
        variant.sku,
        variant.barcode,
        variant.title,
        variant.price,
        variant.compareAtPrice,
        variant.taxable,
        variant.tracked,
        variant.inventoryPolicy,
        JSON.stringify(variant.optionValues),
        JSON.stringify(variant.sourcePayload)
      ]
    );

    return result.rows[0].id;
  }

  private async insertInventorySnapshot(variantId: string, snapshot: NormalizedInventorySnapshotRecord) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO inventory_snapshots (
          variant_id,
          external_variant_id,
          external_inventory_item_id,
          available,
          source_payload,
          captured_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
        RETURNING id
      `,
      [
        variantId,
        snapshot.externalVariantId,
        snapshot.externalInventoryItemId,
        snapshot.available,
        JSON.stringify(snapshot.sourcePayload)
      ]
    );

    return result.rows[0].id;
  }

  private async upsertOrder(order: NormalizedOrderRecord) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO orders (
          external_order_id,
          order_number,
          currency_code,
          financial_status,
          fulfillment_status,
          customer_email,
          subtotal_price,
          total_discount,
          total_tax,
          total_price,
          ordered_at,
          source_payload,
          synced_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, NOW(), NOW())
        ON CONFLICT (external_order_id) DO UPDATE
        SET order_number = EXCLUDED.order_number,
            currency_code = EXCLUDED.currency_code,
            financial_status = EXCLUDED.financial_status,
            fulfillment_status = EXCLUDED.fulfillment_status,
            customer_email = EXCLUDED.customer_email,
            subtotal_price = EXCLUDED.subtotal_price,
            total_discount = EXCLUDED.total_discount,
            total_tax = EXCLUDED.total_tax,
            total_price = EXCLUDED.total_price,
            ordered_at = EXCLUDED.ordered_at,
            source_payload = EXCLUDED.source_payload,
            synced_at = NOW(),
            updated_at = NOW()
        RETURNING id
      `,
      [
        order.externalOrderId,
        order.orderNumber,
        order.currencyCode,
        order.financialStatus,
        order.fulfillmentStatus,
        order.customerEmail,
        order.subtotalPrice,
        order.totalDiscount,
        order.totalTax,
        order.totalPrice,
        order.orderedAt,
        JSON.stringify(order.sourcePayload)
      ]
    );

    return result.rows[0].id;
  }

  private async upsertOrderLine(orderId: string, line: NormalizedOrderLineRecord) {
    const result = await this.client.query<{ id: string }>(
      `
        INSERT INTO order_lines (
          order_id,
          external_line_item_id,
          external_variant_id,
          sku,
          title,
          quantity,
          unit_price,
          total_discount,
          source_payload
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (external_line_item_id) DO UPDATE
        SET order_id = EXCLUDED.order_id,
            external_variant_id = EXCLUDED.external_variant_id,
            sku = EXCLUDED.sku,
            title = EXCLUDED.title,
            quantity = EXCLUDED.quantity,
            unit_price = EXCLUDED.unit_price,
            total_discount = EXCLUDED.total_discount,
            source_payload = EXCLUDED.source_payload
        RETURNING id
      `,
      [
        orderId,
        line.externalLineItemId,
        line.externalVariantId,
        line.sku,
        line.title,
        line.quantity,
        line.unitPrice,
        line.totalDiscount,
        JSON.stringify(line.sourcePayload)
      ]
    );

    return result.rows[0].id;
  }
}
