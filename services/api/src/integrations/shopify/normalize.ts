type JsonRecord = Record<string, unknown>;

export type NormalizedProductRecord = {
  externalProductId: string;
  title: string;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  status: string;
  tags: string[];
  sourcePayload: unknown;
};

export type NormalizedVariantRecord = {
  externalVariantId: string;
  externalProductId: string;
  externalInventoryItemId: string | null;
  sku: string | null;
  barcode: string | null;
  title: string;
  price: number | null;
  compareAtPrice: number | null;
  taxable: boolean | null;
  tracked: boolean | null;
  inventoryPolicy: string | null;
  optionValues: string[];
  sourcePayload: unknown;
};

export type NormalizedInventorySnapshotRecord = {
  externalVariantId: string;
  externalInventoryItemId: string | null;
  available: number | null;
  sourcePayload: unknown;
};

export type NormalizedOrderRecord = {
  externalOrderId: string;
  orderNumber: string | null;
  currencyCode: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  customerEmail: string | null;
  subtotalPrice: number | null;
  totalDiscount: number | null;
  totalTax: number | null;
  totalPrice: number | null;
  orderedAt: string | null;
  sourcePayload: unknown;
};

export type NormalizedOrderLineRecord = {
  externalLineItemId: string;
  externalOrderId: string;
  externalVariantId: string | null;
  sku: string | null;
  title: string;
  quantity: number;
  unitPrice: number | null;
  totalDiscount: number | null;
  sourcePayload: unknown;
};

export type ProductIngestionPreview = {
  product: NormalizedProductRecord;
  variants: NormalizedVariantRecord[];
  inventorySnapshots: NormalizedInventorySnapshotRecord[];
};

export type OrderIngestionPreview = {
  order: NormalizedOrderRecord;
  orderLines: NormalizedOrderLineRecord[];
};

export type NormalizationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function asArray(record: JsonRecord, key: string): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function readString(record: JsonRecord, key: string): string | null {
  const value = record[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function readNumber(record: JsonRecord, key: string): number | null {
  const value = record[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readBoolean(record: JsonRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function readTags(record: JsonRecord): string[] {
  const rawTags = readString(record, "tags");

  if (!rawTags) {
    return [];
  }

  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function readOptionValues(record: JsonRecord): string[] {
  return ["option1", "option2", "option3"]
    .map((key) => readString(record, key))
    .filter((value): value is string => Boolean(value));
}

export function normalizeShopifyProductPayload(
  payload: unknown
): NormalizationResult<ProductIngestionPreview> {
  const record = asRecord(payload);

  if (!record) {
    return {
      ok: false,
      error: "Product payload must be a JSON object."
    };
  }

  const externalProductId = readString(record, "id");
  const title = readString(record, "title");

  if (!externalProductId || !title) {
    return {
      ok: false,
      error: "Product payload is missing required fields: id and title."
    };
  }

  const variantPayloads = asArray(record, "variants");

  const variants = variantPayloads
    .map((item) => asRecord(item))
    .filter((item): item is JsonRecord => item !== null)
    .map<NormalizedVariantRecord>((variant, index) => {
      const externalVariantId = readString(variant, "id") ?? `${externalProductId}-variant-${index + 1}`;

      return {
        externalVariantId,
        externalProductId,
        externalInventoryItemId: readString(variant, "inventory_item_id"),
        sku: readString(variant, "sku"),
        barcode: readString(variant, "barcode"),
        title: readString(variant, "title") ?? "Default Title",
        price: readNumber(variant, "price"),
        compareAtPrice: readNumber(variant, "compare_at_price"),
        taxable: readBoolean(variant, "taxable"),
        tracked: readBoolean(variant, "tracked"),
        inventoryPolicy: readString(variant, "inventory_policy"),
        optionValues: readOptionValues(variant),
        sourcePayload: variant
      };
    });

  const inventorySnapshots = variants.map<NormalizedInventorySnapshotRecord>((variant, index) => {
    const variantPayload = asRecord(variantPayloads[index]) ?? {};

    return {
      externalVariantId: variant.externalVariantId,
      externalInventoryItemId: variant.externalInventoryItemId,
      available: readNumber(variantPayload, "inventory_quantity"),
      sourcePayload: variantPayload
    };
  });

  return {
    ok: true,
    data: {
      product: {
        externalProductId,
        title,
        handle: readString(record, "handle"),
        vendor: readString(record, "vendor"),
        productType: readString(record, "product_type"),
        status: readString(record, "status") ?? "unknown",
        tags: readTags(record),
        sourcePayload: record
      },
      variants,
      inventorySnapshots
    }
  };
}

export function normalizeShopifyOrderPayload(
  payload: unknown
): NormalizationResult<OrderIngestionPreview> {
  const record = asRecord(payload);

  if (!record) {
    return {
      ok: false,
      error: "Order payload must be a JSON object."
    };
  }

  const externalOrderId = readString(record, "id");

  if (!externalOrderId) {
    return {
      ok: false,
      error: "Order payload is missing required field: id."
    };
  }

  const orderLinePayloads = asArray(record, "line_items");

  const orderLines = orderLinePayloads
    .map((item) => asRecord(item))
    .filter((item): item is JsonRecord => item !== null)
    .map<NormalizedOrderLineRecord>((line, index) => {
      const quantity = readNumber(line, "quantity") ?? 0;
      const priceSet = asRecord(line.price_set);
      const shopMoney = priceSet ? asRecord(priceSet.shop_money) : null;

      return {
        externalLineItemId: readString(line, "id") ?? `${externalOrderId}-line-${index + 1}`,
        externalOrderId,
        externalVariantId: readString(line, "variant_id"),
        sku: readString(line, "sku"),
        title: readString(line, "title") ?? "Untitled line",
        quantity,
        unitPrice: readNumber(line, "price") ?? (shopMoney ? readNumber(shopMoney, "amount") : null),
        totalDiscount: readNumber(line, "total_discount"),
        sourcePayload: line
      };
    });

  return {
    ok: true,
    data: {
      order: {
        externalOrderId,
        orderNumber: readString(record, "name") ?? readString(record, "order_number"),
        currencyCode: readString(record, "currency"),
        financialStatus: readString(record, "financial_status"),
        fulfillmentStatus: readString(record, "fulfillment_status"),
        customerEmail: readString(record, "email"),
        subtotalPrice: readNumber(record, "subtotal_price"),
        totalDiscount: readNumber(record, "total_discounts"),
        totalTax: readNumber(record, "total_tax"),
        totalPrice: readNumber(record, "total_price"),
        orderedAt: readString(record, "created_at"),
        sourcePayload: record
      },
      orderLines
    }
  };
}

export function getShopifyConnectionStatus() {
  return {
    storeDomainConfigured: Boolean(process.env.SHOPIFY_STORE_DOMAIN),
    adminTokenConfigured: Boolean(process.env.SHOPIFY_ADMIN_TOKEN),
    warehouseConfigured: Boolean(process.env.POSTGRES_URL),
    projectPhase: "shopify-first"
  };
}
