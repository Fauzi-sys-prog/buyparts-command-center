import { query } from "../client.js";

type CountRow = {
  tracked_products: string;
  tracked_variants: string;
  total_orders: string;
  open_alerts: string;
  pending_pricing_recommendations: string;
  pending_catalog_enrichment_runs: string;
  sync_runs_last_24h: string;
  successful_sync_runs_last_24h: string;
  last_sync_at: string | null;
};

type PricingRecommendationRow = {
  id: string;
  external_variant_id: string;
  sku: string | null;
  current_price: string | null;
  recommended_price: string;
  confidence_score: string | null;
  status: string;
  created_at: string;
  change_percent: string | null;
};

type CatalogEnrichmentRunRow = {
  id: string;
  external_product_id: string;
  status: string;
  provider: string | null;
  prompt_version: string | null;
  created_at: string;
  completed_at: string | null;
};

type CatalogEnrichmentRunDetailRow = {
  id: string;
  external_product_id: string;
  status: string;
  provider: string | null;
  prompt_version: string | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  input_payload: unknown;
  output_payload: unknown;
  product_title: string;
  handle: string | null;
  vendor: string | null;
  product_type: string | null;
  product_status: string;
  tags: unknown;
  source_payload: unknown;
};

type CatalogReviewWorkspaceRow = {
  checklist: unknown;
  notes: string;
  operator_label: string | null;
  created_at: string;
  updated_at: string;
};

type CatalogReviewEventRow = {
  id: string;
  event_type: string;
  summary: string;
  payload: unknown;
  created_at: string;
};

type PricingReviewEventRow = {
  id: string;
  pricing_recommendation_id: string;
  event_type: string;
  summary: string;
  payload: unknown;
  created_at: string;
};

type AlertRow = {
  id: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  title: string;
  detail: string | null;
  created_at: string;
};

type SyncRunRow = {
  id: string;
  connector: string;
  resource_type: string;
  trigger_type: string;
  status: string;
  external_reference: string | null;
  started_at: string;
  finished_at: string | null;
};

type ActivityFeedRow = {
  id: string;
  scope: string;
  event_type: string;
  summary: string;
  target_kind: string;
  target_id: string;
  target_label: string;
  operator_label: string | null;
  source: string | null;
  created_at: string;
};

type SkuOverviewRow = {
  external_variant_id: string;
  external_product_id: string;
  sku: string | null;
  product_title: string;
  variant_title: string;
  vendor: string | null;
  product_type: string | null;
  current_price: string | null;
  available_inventory: string | null;
  units_sold: string | null;
  units_sold_30d: string | null;
  orders_count: string | null;
  last_ordered_at: string | null;
  pricing_status: string | null;
  recommended_price: string | null;
  catalog_status: string | null;
  catalog_provider: string | null;
};

type SkuDetailSummaryRow = {
  external_variant_id: string;
  external_product_id: string;
  sku: string | null;
  barcode: string | null;
  product_title: string;
  variant_title: string;
  vendor: string | null;
  product_type: string | null;
  product_status: string;
  tags: unknown;
  current_price: string | null;
  compare_at_price: string | null;
  tracked: boolean | null;
  inventory_policy: string | null;
  available_inventory: string | null;
  units_sold: string | null;
  units_sold_30d: string | null;
  orders_count: string | null;
  last_ordered_at: string | null;
  pricing_status: string | null;
  recommended_price: string | null;
  catalog_status: string | null;
  catalog_provider: string | null;
};

type SkuOrderHistoryRow = {
  external_order_id: string;
  order_number: string | null;
  ordered_at: string | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  quantity: string;
  unit_price: string | null;
  line_total: string | null;
};

type SkuInventoryHistoryRow = {
  id: string;
  available: string | null;
  committed: string | null;
  incoming: string | null;
  on_hand: string | null;
  captured_at: string;
};

type SkuPricingHistoryRow = {
  id: string;
  current_price: string | null;
  recommended_price: string;
  confidence_score: string | null;
  status: string;
  reasons: unknown;
  created_at: string;
  reviewed_at: string | null;
  review_operator_label: string | null;
  review_source: string | null;
  checklist: unknown;
  notes: string | null;
  operator_label: string | null;
  workspace_created_at: string | null;
  workspace_updated_at: string | null;
};

type SkuCatalogHistoryRow = {
  id: string;
  status: string;
  provider: string | null;
  prompt_version: string | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
};

export type DashboardMetrics = {
  trackedProducts: number;
  trackedVariants: number;
  totalOrders: number;
  openAlerts: number;
  pendingPricingRecommendations: number;
  pendingCatalogEnrichmentRuns: number;
};

export type SyncHealthSnapshot = {
  totalRunsLast24h: number;
  successfulRunsLast24h: number;
  successRateLast24h: number | null;
  lastSyncAt: string | null;
};

export type PricingRecommendationListItem = {
  id: string;
  externalVariantId: string;
  sku: string | null;
  currentPrice: number | null;
  recommendedPrice: number;
  confidenceScore: number | null;
  status: string;
  createdAt: string;
  changePercent: number | null;
};

export type CatalogEnrichmentRunListItem = {
  id: string;
  externalProductId: string;
  status: string;
  provider: string | null;
  promptVersion: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type AlertListItem = {
  id: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  title: string;
  detail: string | null;
  createdAt: string;
};

export type SyncRunListItem = {
  id: string;
  connector: string;
  resourceType: string;
  triggerType: string;
  status: string;
  externalReference: string | null;
  startedAt: string;
  finishedAt: string | null;
};

export type ActivityFeedItem = {
  id: string;
  scope: "pricing" | "catalog";
  eventType: string;
  summary: string;
  targetKind: "sku" | "catalog_run";
  targetId: string;
  targetLabel: string;
  operatorLabel: string | null;
  source: string | null;
  createdAt: string;
};

export type SkuOverviewItem = {
  externalVariantId: string;
  externalProductId: string;
  sku: string | null;
  productTitle: string;
  variantTitle: string;
  vendor: string | null;
  productType: string | null;
  currentPrice: number | null;
  availableInventory: number;
  unitsSold: number;
  unitsSold30d: number;
  ordersCount: number;
  lastOrderedAt: string | null;
  pricingStatus: string | null;
  recommendedPrice: number | null;
  catalogStatus: string | null;
  catalogProvider: string | null;
};

export type SkuDetailSummary = SkuOverviewItem & {
  barcode: string | null;
  productStatus: string;
  tags: string[];
  compareAtPrice: number | null;
  tracked: boolean | null;
  inventoryPolicy: string | null;
};

export type SkuOrderHistoryItem = {
  externalOrderId: string;
  orderNumber: string | null;
  orderedAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type SkuInventoryHistoryItem = {
  id: string;
  available: number;
  committed: number | null;
  incoming: number | null;
  onHand: number | null;
  capturedAt: string;
};

export type SkuPricingHistoryItem = {
  id: string;
  currentPrice: number | null;
  recommendedPrice: number;
  confidenceScore: number | null;
  status: string;
  reasons: string[];
  createdAt: string;
  reviewedAt: string | null;
  reviewOperatorLabel: string | null;
  reviewSource: string | null;
  reviewState: {
    checklist: {
      margin: boolean;
      inventory: boolean;
      velocity: boolean;
      rationale: boolean;
    };
    notes: string;
    operatorLabel: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  reviewEvents: Array<{
    id: string;
    eventType: string;
    summary: string;
    payload: Record<string, unknown>;
    createdAt: string;
  }>;
};

export type SkuCatalogHistoryItem = {
  id: string;
  status: string;
  provider: string | null;
  promptVersion: string | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
};

export type SkuDetail = {
  summary: SkuDetailSummary;
  orderHistory: SkuOrderHistoryItem[];
  inventoryHistory: SkuInventoryHistoryItem[];
  pricingHistory: SkuPricingHistoryItem[];
  catalogHistory: SkuCatalogHistoryItem[];
};

export type CatalogRunReviewDraft = {
  mode: "dry_run_template" | "payload";
  proposedTitle: string;
  proposedHighlights: string[];
  normalizedAttributes: Array<{
    label: string;
    value: string;
  }>;
  fitmentSignals: string[];
  rationale: string;
};

export type CatalogRunReviewState = {
  checklist: {
    title: boolean;
    highlights: boolean;
    attributes: boolean;
    fitment: boolean;
    payload: boolean;
  };
  notes: string;
  operatorLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CatalogRunReviewEvent = {
  id: string;
  eventType: string;
  summary: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CatalogEnrichmentRunDetail = {
  id: string;
  externalProductId: string;
  status: string;
  provider: string | null;
  promptVersion: string | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  product: {
    title: string;
    handle: string | null;
    vendor: string | null;
    productType: string | null;
    productStatus: string;
    tags: string[];
    sourcePayload: Record<string, unknown>;
  };
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown> | null;
  reviewDraft: CatalogRunReviewDraft;
  reviewState: CatalogRunReviewState;
  reviewEvents: CatalogRunReviewEvent[];
};

export type DashboardReadModel = {
  generatedAt: string;
  metrics: DashboardMetrics;
  syncHealth: SyncHealthSnapshot;
  recentPricingRecommendations: PricingRecommendationListItem[];
  recentCatalogEnrichmentRuns: CatalogEnrichmentRunListItem[];
  recentActivity: ActivityFeedItem[];
  recentAlerts: AlertListItem[];
  recentSyncRuns: SyncRunListItem[];
};

const DASHBOARD_LIST_LIMIT = 5;

function toInt(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number.parseInt(value, 10);
}

function toFloat(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return null;
  }

  return Number.parseFloat(value);
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toNullableRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function normalizeCatalogChecklist(value: unknown): CatalogRunReviewState["checklist"] {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return {
    title: record.title === true,
    highlights: record.highlights === true,
    attributes: record.attributes === true,
    fitment: record.fitment === true,
    payload: record.payload === true
  };
}

function normalizePricingChecklist(value: unknown): SkuPricingHistoryItem["reviewState"]["checklist"] {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    margin: record.margin === true,
    inventory: record.inventory === true,
    velocity: record.velocity === true,
    rationale: record.rationale === true
  };
}

function buildCatalogReviewDraft(
  product: {
    title: string;
    vendor: string | null;
    productType: string | null;
    tags: string[];
  },
  inputPayload: Record<string, unknown>,
  outputPayload: Record<string, unknown> | null
): CatalogRunReviewDraft {
  const payloadTitle = typeof outputPayload?.title === "string" ? outputPayload.title : null;
  const inputTitle =
    typeof inputPayload.product_title === "string" ? inputPayload.product_title : product.title;
  const vendor = typeof inputPayload.vendor === "string" ? inputPayload.vendor : product.vendor;
  const productType =
    typeof inputPayload.product_type === "string" ? inputPayload.product_type : product.productType;
  const tags = toStringArray(inputPayload.tags).length > 0 ? toStringArray(inputPayload.tags) : product.tags;
  const promptFamilies = toStringArray(inputPayload.prompt_families);
  const normalizedTagLabels = tags.map((tag) => toTitleCase(tag));

  const proposedTitle =
    payloadTitle ??
    (vendor && !inputTitle.toLowerCase().includes(vendor.toLowerCase())
      ? `${vendor} ${inputTitle}`
      : inputTitle);

  const proposedHighlights = [
    productType ? `${productType} category normalized for internal review.` : null,
    normalizedTagLabels.length > 0 ? `Attribute tags: ${normalizedTagLabels.join(", ")}.` : null,
    promptFamilies.length > 0 ? `Prompt families queued: ${promptFamilies.join(", ")}.` : null
  ].filter((item): item is string => Boolean(item));

  const normalizedAttributes = [
    vendor ? { label: "Vendor", value: vendor } : null,
    productType ? { label: "Product Type", value: productType } : null,
    tags.length > 0 ? { label: "Tags", value: normalizedTagLabels.join(", ") } : null
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const fitmentSignals = tags
    .map((tag) => {
      if (tag === "front" || tag === "rear") {
        return `Position hint: ${toTitleCase(tag)}`;
      }

      if (tag === "toyota") {
        return "Vehicle hint tag: Toyota";
      }

      if (tag === "brake" || tag === "pad") {
        return `Part-family hint: ${toTitleCase(tag)}`;
      }

      return `Catalog tag: ${toTitleCase(tag)}`;
    })
    .slice(0, 4);

  return {
    mode: payloadTitle || outputPayload ? "payload" : "dry_run_template",
    proposedTitle,
    proposedHighlights,
    normalizedAttributes,
    fitmentSignals,
    rationale:
      payloadTitle || outputPayload
        ? "Draft content is being read from the stored output payload for this enrichment run."
        : "This draft is derived from the current input payload because live LLM output has not been stored yet."
  };
}

async function runQuery<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const result = await query<T>(text, values);
  return result?.rows ?? [];
}

export async function getDashboardReadModel(): Promise<DashboardReadModel> {
  const [
    countRows,
    recentPricingRecommendations,
    recentCatalogEnrichmentRuns,
    recentActivity,
    recentAlerts,
    recentSyncRuns
  ] =
    await Promise.all([
      runQuery<CountRow>(`
        SELECT
          (SELECT COUNT(*) FROM products) AS tracked_products,
          (SELECT COUNT(*) FROM variants) AS tracked_variants,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COUNT(*) FROM alerts WHERE status = 'open') AS open_alerts,
          (SELECT COUNT(*) FROM pricing_recommendations WHERE status = 'pending')
            AS pending_pricing_recommendations,
          (
            SELECT COUNT(*)
            FROM catalog_enrichment_runs
            WHERE status NOT IN ('completed', 'failed', 'cancelled')
          ) AS pending_catalog_enrichment_runs,
          (
            SELECT COUNT(*)
            FROM sync_runs
            WHERE started_at >= NOW() - INTERVAL '24 hours'
          ) AS sync_runs_last_24h,
          (
            SELECT COUNT(*)
            FROM sync_runs
            WHERE started_at >= NOW() - INTERVAL '24 hours'
              AND status = 'success'
          ) AS successful_sync_runs_last_24h,
          (
            SELECT MAX(COALESCE(finished_at, started_at))
            FROM sync_runs
          )::text AS last_sync_at
      `),
      listPricingRecommendations(DASHBOARD_LIST_LIMIT),
      listCatalogEnrichmentRuns(DASHBOARD_LIST_LIMIT),
      listRecentActivity(DASHBOARD_LIST_LIMIT),
      listAlerts(DASHBOARD_LIST_LIMIT),
      listSyncRuns(DASHBOARD_LIST_LIMIT)
    ]);

  const counts = countRows[0];
  const totalRunsLast24h = toInt(counts?.sync_runs_last_24h);
  const successfulRunsLast24h = toInt(counts?.successful_sync_runs_last_24h);

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      trackedProducts: toInt(counts?.tracked_products),
      trackedVariants: toInt(counts?.tracked_variants),
      totalOrders: toInt(counts?.total_orders),
      openAlerts: toInt(counts?.open_alerts),
      pendingPricingRecommendations: toInt(counts?.pending_pricing_recommendations),
      pendingCatalogEnrichmentRuns: toInt(counts?.pending_catalog_enrichment_runs)
    },
    syncHealth: {
      totalRunsLast24h,
      successfulRunsLast24h,
      successRateLast24h:
        totalRunsLast24h > 0 ? Number(((successfulRunsLast24h / totalRunsLast24h) * 100).toFixed(1)) : null,
      lastSyncAt: counts?.last_sync_at ?? null
    },
    recentPricingRecommendations,
    recentCatalogEnrichmentRuns,
    recentActivity,
    recentAlerts,
    recentSyncRuns
  };
}

export async function listPricingRecommendations(limit: number, status?: string) {
  const rows = await runQuery<PricingRecommendationRow>(
    `
      SELECT
        id,
        external_variant_id,
        sku,
        current_price::text,
        recommended_price::text,
        confidence_score::text,
        status,
        created_at::text,
        CASE
          WHEN current_price IS NULL OR current_price = 0 THEN NULL
          ELSE ROUND(((recommended_price - current_price) / current_price) * 100, 2)::text
        END AS change_percent
      FROM pricing_recommendations
      WHERE ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit, status ?? null]
  );

  return rows.map((row) => ({
    id: row.id,
    externalVariantId: row.external_variant_id,
    sku: row.sku,
    currentPrice: toFloat(row.current_price),
    recommendedPrice: toFloat(row.recommended_price) ?? 0,
    confidenceScore: toFloat(row.confidence_score),
    status: row.status,
    createdAt: row.created_at,
    changePercent: toFloat(row.change_percent)
  }));
}

export async function listCatalogEnrichmentRuns(limit: number, status?: string) {
  const rows = await runQuery<CatalogEnrichmentRunRow>(
    `
      SELECT
        id,
        external_product_id,
        status,
        provider,
        prompt_version,
        created_at::text,
        completed_at::text
      FROM catalog_enrichment_runs
      WHERE ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit, status ?? null]
  );

  return rows.map((row) => ({
    id: row.id,
    externalProductId: row.external_product_id,
    status: row.status,
    provider: row.provider,
    promptVersion: row.prompt_version,
    createdAt: row.created_at,
    completedAt: row.completed_at
  }));
}

export async function listRecentActivity(limit: number) {
  const rows = await runQuery<ActivityFeedRow>(
    `
      SELECT
        id,
        scope,
        event_type,
        summary,
        target_kind,
        target_id,
        target_label,
        operator_label,
        source,
        created_at
      FROM (
        SELECT
          CONCAT('pricing-event:', pre.id)::text AS id,
          'pricing'::text AS scope,
          pre.event_type::text,
          pre.summary::text AS summary,
          'sku'::text AS target_kind,
          pr.external_variant_id::text AS target_id,
          COALESCE(pr.sku, pr.external_variant_id)::text AS target_label,
          COALESCE(pre.payload->>'operatorLabel', pr.review_operator_label)::text AS operator_label,
          COALESCE(pre.payload->>'source', pr.review_source)::text AS source,
          pre.created_at::text AS created_at
        FROM pricing_review_events pre
        JOIN pricing_recommendations pr ON pr.id = pre.pricing_recommendation_id

        UNION ALL

        SELECT
          CONCAT('pricing-legacy:', pr.id)::text AS id,
          'pricing'::text AS scope,
          pr.status::text AS event_type,
          CASE
            WHEN pr.status = 'approved' THEN
              CONCAT(COALESCE(pr.review_operator_label, 'Local operator'), ' approved pricing for ', COALESCE(pr.sku, pr.external_variant_id), '.')
            WHEN pr.status = 'rejected' THEN
              CONCAT(COALESCE(pr.review_operator_label, 'Local operator'), ' rejected pricing for ', COALESCE(pr.sku, pr.external_variant_id), '.')
            ELSE
              CONCAT(COALESCE(pr.review_operator_label, 'Local operator'), ' reviewed pricing for ', COALESCE(pr.sku, pr.external_variant_id), '.')
          END::text AS summary,
          'sku'::text AS target_kind,
          pr.external_variant_id::text AS target_id,
          COALESCE(pr.sku, pr.external_variant_id)::text AS target_label,
          pr.review_operator_label::text AS operator_label,
          pr.review_source::text AS source,
          pr.reviewed_at::text AS created_at
        FROM pricing_recommendations pr
        WHERE pr.reviewed_at IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM pricing_review_events pre
            WHERE pre.pricing_recommendation_id = pr.id
              AND pre.event_type = 'status_updated'
          )

        UNION ALL

        SELECT
          CONCAT('catalog:', cre.id)::text AS id,
          'catalog'::text AS scope,
          cre.event_type::text,
          cre.summary::text,
          'catalog_run'::text AS target_kind,
          cer.id::text AS target_id,
          COALESCE(p.title, cer.external_product_id)::text AS target_label,
          COALESCE(cre.payload->>'operatorLabel', crw.operator_label)::text AS operator_label,
          (cre.payload->>'source')::text AS source,
          cre.created_at::text AS created_at
        FROM catalog_review_events cre
        JOIN catalog_enrichment_runs cer ON cer.id = cre.catalog_run_id
        LEFT JOIN catalog_review_workspaces crw ON crw.catalog_run_id = cer.id
        LEFT JOIN products p ON p.external_product_id = cer.external_product_id
      ) activity
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    scope: (row.scope === "catalog" ? "catalog" : "pricing") as ActivityFeedItem["scope"],
    eventType: row.event_type,
    summary: row.summary,
    targetKind: (row.target_kind === "catalog_run" ? "catalog_run" : "sku") as ActivityFeedItem["targetKind"],
    targetId: row.target_id,
    targetLabel: row.target_label,
    operatorLabel: row.operator_label,
    source: row.source,
    createdAt: row.created_at
  }));
}

export async function listAlerts(limit: number, status?: string) {
  const rows = await runQuery<AlertRow>(
    `
      SELECT
        id,
        type,
        severity,
        status,
        source,
        title,
        detail,
        created_at::text
      FROM alerts
      WHERE ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit, status ?? null]
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    severity: row.severity,
    status: row.status,
    source: row.source,
    title: row.title,
    detail: row.detail,
    createdAt: row.created_at
  }));
}

export async function listSyncRuns(limit: number, status?: string, connector?: string) {
  const rows = await runQuery<SyncRunRow>(
    `
      SELECT
        id,
        connector,
        resource_type,
        trigger_type,
        status,
        external_reference,
        started_at::text,
        finished_at::text
      FROM sync_runs
      WHERE ($2::text IS NULL OR status = $2)
        AND ($3::text IS NULL OR connector = $3)
      ORDER BY started_at DESC
      LIMIT $1
    `,
    [limit, status ?? null, connector ?? null]
  );

  return rows.map((row) => ({
    id: row.id,
    connector: row.connector,
    resourceType: row.resource_type,
    triggerType: row.trigger_type,
    status: row.status,
    externalReference: row.external_reference,
    startedAt: row.started_at,
    finishedAt: row.finished_at
  }));
}

export async function listSkuOverview(limit: number) {
  const rows = await runQuery<SkuOverviewRow>(
    `
      WITH latest_inventory AS (
        SELECT DISTINCT ON (variant_id)
          variant_id,
          available
        FROM inventory_snapshots
        ORDER BY variant_id, captured_at DESC, created_at DESC
      ),
      sales AS (
        SELECT
          ol.external_variant_id,
          COALESCE(SUM(ol.quantity), 0)::int AS units_sold,
          COALESCE(
            SUM(
              CASE
                WHEN o.ordered_at >= NOW() - INTERVAL '30 days' THEN ol.quantity
                ELSE 0
              END
            ),
            0
          )::int AS units_sold_30d,
          COUNT(DISTINCT ol.order_id)::int AS orders_count,
          MAX(o.ordered_at)::text AS last_ordered_at
        FROM order_lines ol
        LEFT JOIN orders o ON o.id = ol.order_id
        GROUP BY ol.external_variant_id
      ),
      latest_pricing AS (
        SELECT DISTINCT ON (external_variant_id)
          external_variant_id,
          status AS pricing_status,
          recommended_price::text AS recommended_price
        FROM pricing_recommendations
        ORDER BY external_variant_id, created_at DESC
      ),
      latest_catalog AS (
        SELECT DISTINCT ON (external_product_id)
          external_product_id,
          status AS catalog_status,
          provider AS catalog_provider
        FROM catalog_enrichment_runs
        ORDER BY external_product_id, created_at DESC
      )
      SELECT
        v.external_variant_id,
        p.external_product_id,
        v.sku,
        p.title AS product_title,
        v.title AS variant_title,
        p.vendor,
        p.product_type,
        v.price::text AS current_price,
        COALESCE(latest_inventory.available, 0)::text AS available_inventory,
        COALESCE(sales.units_sold, 0)::text AS units_sold,
        COALESCE(sales.units_sold_30d, 0)::text AS units_sold_30d,
        COALESCE(sales.orders_count, 0)::text AS orders_count,
        sales.last_ordered_at,
        latest_pricing.pricing_status,
        latest_pricing.recommended_price,
        latest_catalog.catalog_status,
        latest_catalog.catalog_provider
      FROM variants v
      JOIN products p ON p.id = v.product_id
      LEFT JOIN latest_inventory ON latest_inventory.variant_id = v.id
      LEFT JOIN sales ON sales.external_variant_id = v.external_variant_id
      LEFT JOIN latest_pricing ON latest_pricing.external_variant_id = v.external_variant_id
      LEFT JOIN latest_catalog ON latest_catalog.external_product_id = p.external_product_id
      ORDER BY
        COALESCE(sales.units_sold_30d, 0) DESC,
        COALESCE(sales.units_sold, 0) DESC,
        COALESCE(latest_inventory.available, 0) ASC,
        v.synced_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return rows.map((row) => ({
    externalVariantId: row.external_variant_id,
    externalProductId: row.external_product_id,
    sku: row.sku,
    productTitle: row.product_title,
    variantTitle: row.variant_title,
    vendor: row.vendor,
    productType: row.product_type,
    currentPrice: toFloat(row.current_price),
    availableInventory: toInt(row.available_inventory),
    unitsSold: toInt(row.units_sold),
    unitsSold30d: toInt(row.units_sold_30d),
    ordersCount: toInt(row.orders_count),
    lastOrderedAt: row.last_ordered_at,
    pricingStatus: row.pricing_status,
    recommendedPrice: toFloat(row.recommended_price),
    catalogStatus: row.catalog_status,
    catalogProvider: row.catalog_provider
  }));
}

export async function getSkuDetail(externalVariantId: string): Promise<SkuDetail | null> {
  const summaryRows = await runQuery<SkuDetailSummaryRow>(
    `
      WITH latest_inventory AS (
        SELECT DISTINCT ON (variant_id)
          variant_id,
          available
        FROM inventory_snapshots
        ORDER BY variant_id, captured_at DESC, created_at DESC
      ),
      sales AS (
        SELECT
          ol.external_variant_id,
          COALESCE(SUM(ol.quantity), 0)::int AS units_sold,
          COALESCE(
            SUM(
              CASE
                WHEN o.ordered_at >= NOW() - INTERVAL '30 days' THEN ol.quantity
                ELSE 0
              END
            ),
            0
          )::int AS units_sold_30d,
          COUNT(DISTINCT ol.order_id)::int AS orders_count,
          MAX(o.ordered_at)::text AS last_ordered_at
        FROM order_lines ol
        LEFT JOIN orders o ON o.id = ol.order_id
        GROUP BY ol.external_variant_id
      ),
      latest_pricing AS (
        SELECT DISTINCT ON (external_variant_id)
          external_variant_id,
          status AS pricing_status,
          recommended_price::text AS recommended_price
        FROM pricing_recommendations
        ORDER BY external_variant_id, created_at DESC
      ),
      latest_catalog AS (
        SELECT DISTINCT ON (external_product_id)
          external_product_id,
          status AS catalog_status,
          provider AS catalog_provider
        FROM catalog_enrichment_runs
        ORDER BY external_product_id, created_at DESC
      )
      SELECT
        v.external_variant_id,
        p.external_product_id,
        v.sku,
        v.barcode,
        p.title AS product_title,
        v.title AS variant_title,
        p.vendor,
        p.product_type,
        p.status AS product_status,
        p.tags,
        v.price::text AS current_price,
        v.compare_at_price::text AS compare_at_price,
        v.tracked,
        v.inventory_policy,
        COALESCE(latest_inventory.available, 0)::text AS available_inventory,
        COALESCE(sales.units_sold, 0)::text AS units_sold,
        COALESCE(sales.units_sold_30d, 0)::text AS units_sold_30d,
        COALESCE(sales.orders_count, 0)::text AS orders_count,
        sales.last_ordered_at,
        latest_pricing.pricing_status,
        latest_pricing.recommended_price,
        latest_catalog.catalog_status,
        latest_catalog.catalog_provider
      FROM variants v
      JOIN products p ON p.id = v.product_id
      LEFT JOIN latest_inventory ON latest_inventory.variant_id = v.id
      LEFT JOIN sales ON sales.external_variant_id = v.external_variant_id
      LEFT JOIN latest_pricing ON latest_pricing.external_variant_id = v.external_variant_id
      LEFT JOIN latest_catalog ON latest_catalog.external_product_id = p.external_product_id
      WHERE v.external_variant_id = $1
      LIMIT 1
    `,
    [externalVariantId]
  );

  const summary = summaryRows[0];

  if (!summary) {
    return null;
  }

  const [orderHistoryRows, inventoryHistoryRows, pricingHistoryRows, pricingEventRows, catalogHistoryRows] =
    await Promise.all([
      runQuery<SkuOrderHistoryRow>(
        `
          SELECT
            o.external_order_id,
            o.order_number,
            COALESCE(o.ordered_at, o.created_at)::text AS ordered_at,
            o.financial_status,
            o.fulfillment_status,
            ol.quantity::text,
            ol.unit_price::text,
            CASE
              WHEN ol.unit_price IS NULL THEN NULL
              ELSE ROUND((ol.quantity * ol.unit_price)::numeric, 2)::text
            END AS line_total
          FROM order_lines ol
          JOIN orders o ON o.id = ol.order_id
          WHERE ol.external_variant_id = $1
          ORDER BY COALESCE(o.ordered_at, o.created_at) DESC
          LIMIT 10
        `,
        [externalVariantId]
      ),
      runQuery<SkuInventoryHistoryRow>(
        `
          SELECT
            id,
            available::text,
            committed::text,
            incoming::text,
            on_hand::text,
            captured_at::text
          FROM inventory_snapshots
          WHERE external_variant_id = $1
          ORDER BY captured_at DESC, created_at DESC
          LIMIT 12
        `,
        [externalVariantId]
      ),
      runQuery<SkuPricingHistoryRow>(
        `
          SELECT
            pr.id,
            pr.current_price::text,
            pr.recommended_price::text,
            pr.confidence_score::text,
            pr.status,
            pr.reasons,
            pr.created_at::text,
            pr.reviewed_at::text,
            pr.review_operator_label,
            pr.review_source,
            prw.checklist,
            prw.notes,
            prw.operator_label,
            prw.created_at::text AS workspace_created_at,
            prw.updated_at::text AS workspace_updated_at
          FROM pricing_recommendations
          pr
          LEFT JOIN pricing_review_workspaces prw
            ON prw.pricing_recommendation_id = pr.id
          WHERE pr.external_variant_id = $1
          ORDER BY pr.created_at DESC
          LIMIT 12
        `,
        [externalVariantId]
      ),
      runQuery<PricingReviewEventRow>(
        `
          SELECT
            pre.id,
            pre.pricing_recommendation_id,
            pre.event_type,
            pre.summary,
            pre.payload,
            pre.created_at::text
          FROM pricing_review_events pre
          JOIN pricing_recommendations pr ON pr.id = pre.pricing_recommendation_id
          WHERE pr.external_variant_id = $1
          ORDER BY pre.created_at DESC
        `,
        [externalVariantId]
      ),
      runQuery<SkuCatalogHistoryRow>(
        `
          SELECT
            id,
            status,
            provider,
            prompt_version,
            created_at::text,
            completed_at::text,
            error_message
          FROM catalog_enrichment_runs
          WHERE external_product_id = $1
          ORDER BY created_at DESC
          LIMIT 12
        `,
        [summary.external_product_id]
      )
    ]);

  const pricingEventsByRecommendation = pricingEventRows.reduce<
    Record<string, Array<SkuPricingHistoryItem["reviewEvents"][number]>>
  >((result, row) => {
    const nextItem = {
      id: row.id,
      eventType: row.event_type,
      summary: row.summary,
      payload: toRecord(row.payload),
      createdAt: row.created_at
    };

    if (!result[row.pricing_recommendation_id]) {
      result[row.pricing_recommendation_id] = [nextItem];
    } else {
      result[row.pricing_recommendation_id].push(nextItem);
    }

    return result;
  }, {});

  return {
    summary: {
      externalVariantId: summary.external_variant_id,
      externalProductId: summary.external_product_id,
      sku: summary.sku,
      barcode: summary.barcode,
      productTitle: summary.product_title,
      variantTitle: summary.variant_title,
      vendor: summary.vendor,
      productType: summary.product_type,
      productStatus: summary.product_status,
      tags: toStringArray(summary.tags),
      currentPrice: toFloat(summary.current_price),
      compareAtPrice: toFloat(summary.compare_at_price),
      tracked: summary.tracked,
      inventoryPolicy: summary.inventory_policy,
      availableInventory: toInt(summary.available_inventory),
      unitsSold: toInt(summary.units_sold),
      unitsSold30d: toInt(summary.units_sold_30d),
      ordersCount: toInt(summary.orders_count),
      lastOrderedAt: summary.last_ordered_at,
      pricingStatus: summary.pricing_status,
      recommendedPrice: toFloat(summary.recommended_price),
      catalogStatus: summary.catalog_status,
      catalogProvider: summary.catalog_provider
    },
    orderHistory: orderHistoryRows.map((row) => ({
      externalOrderId: row.external_order_id,
      orderNumber: row.order_number,
      orderedAt: row.ordered_at,
      financialStatus: row.financial_status,
      fulfillmentStatus: row.fulfillment_status,
      quantity: toInt(row.quantity),
      unitPrice: toFloat(row.unit_price),
      lineTotal: toFloat(row.line_total)
    })),
    inventoryHistory: inventoryHistoryRows.map((row) => ({
      id: row.id,
      available: toInt(row.available),
      committed: toFloat(row.committed),
      incoming: toFloat(row.incoming),
      onHand: toFloat(row.on_hand),
      capturedAt: row.captured_at
    })),
    pricingHistory: pricingHistoryRows.map((row) => ({
      id: row.id,
      currentPrice: toFloat(row.current_price),
      recommendedPrice: toFloat(row.recommended_price) ?? 0,
      confidenceScore: toFloat(row.confidence_score),
      status: row.status,
      reasons: toStringArray(row.reasons),
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
      reviewOperatorLabel: row.review_operator_label,
      reviewSource: row.review_source,
      reviewState: {
        checklist: normalizePricingChecklist(row.checklist),
        notes: row.notes ?? "",
        operatorLabel: row.operator_label ?? null,
        createdAt: row.workspace_created_at ?? null,
        updatedAt: row.workspace_updated_at ?? null
      },
      reviewEvents: pricingEventsByRecommendation[row.id] ?? []
    })),
    catalogHistory: catalogHistoryRows.map((row) => ({
      id: row.id,
      status: row.status,
      provider: row.provider,
      promptVersion: row.prompt_version,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message
    }))
  };
}

export async function getCatalogEnrichmentRunDetail(
  runId: string
): Promise<CatalogEnrichmentRunDetail | null> {
  const [rows, workspaceRows, eventRows] = await Promise.all([
    runQuery<CatalogEnrichmentRunDetailRow>(
      `
        SELECT
          cer.id,
          cer.external_product_id,
          cer.status,
          cer.provider,
          cer.prompt_version,
          cer.created_at::text,
          cer.completed_at::text,
          cer.error_message,
          cer.input_payload,
          cer.output_payload,
          p.title AS product_title,
          p.handle,
          p.vendor,
          p.product_type,
          p.status AS product_status,
          p.tags,
          p.source_payload
        FROM catalog_enrichment_runs cer
        JOIN products p ON p.external_product_id = cer.external_product_id
        WHERE cer.id = $1
        LIMIT 1
      `,
      [runId]
    ),
    runQuery<CatalogReviewWorkspaceRow>(
      `
        SELECT
          checklist,
          notes,
          operator_label,
          created_at::text,
          updated_at::text
        FROM catalog_review_workspaces
        WHERE catalog_run_id = $1
        LIMIT 1
      `,
      [runId]
    ),
    runQuery<CatalogReviewEventRow>(
      `
        SELECT
          id,
          event_type,
          summary,
          payload,
          created_at::text
        FROM catalog_review_events
        WHERE catalog_run_id = $1
        ORDER BY created_at DESC
        LIMIT 12
      `,
      [runId]
    )
  ]);

  const row = rows[0];

  if (!row) {
    return null;
  }

  const inputPayload = toRecord(row.input_payload);
  const outputPayload = toNullableRecord(row.output_payload);
  const tags = toStringArray(row.tags);
  const workspace = workspaceRows[0];

  return {
    id: row.id,
    externalProductId: row.external_product_id,
    status: row.status,
    provider: row.provider,
    promptVersion: row.prompt_version,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    errorMessage: row.error_message,
    product: {
      title: row.product_title,
      handle: row.handle,
      vendor: row.vendor,
      productType: row.product_type,
      productStatus: row.product_status,
      tags,
      sourcePayload: toRecord(row.source_payload)
    },
    inputPayload,
    outputPayload,
    reviewDraft: buildCatalogReviewDraft(
      {
        title: row.product_title,
        vendor: row.vendor,
        productType: row.product_type,
        tags
      },
      inputPayload,
      outputPayload
    ),
    reviewState: {
      checklist: normalizeCatalogChecklist(workspace?.checklist),
      notes: workspace?.notes ?? "",
      operatorLabel: workspace?.operator_label ?? null,
      createdAt: workspace?.created_at ?? null,
      updatedAt: workspace?.updated_at ?? null
    },
    reviewEvents: eventRows.map((event) => ({
      id: event.id,
      eventType: event.event_type,
      summary: event.summary,
      payload: toRecord(event.payload),
      createdAt: event.created_at
    }))
  };
}
