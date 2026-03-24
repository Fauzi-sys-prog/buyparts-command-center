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

export type DashboardReadModel = {
  generatedAt: string;
  metrics: DashboardMetrics;
  syncHealth: SyncHealthSnapshot;
  recentPricingRecommendations: PricingRecommendationListItem[];
  recentCatalogEnrichmentRuns: CatalogEnrichmentRunListItem[];
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

async function runQuery<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const result = await query<T>(text, values);
  return result?.rows ?? [];
}

export async function getDashboardReadModel(): Promise<DashboardReadModel> {
  const [countRows, recentPricingRecommendations, recentCatalogEnrichmentRuns, recentAlerts, recentSyncRuns] =
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
            WHERE status NOT IN ('completed', 'failed')
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

export async function listSyncRuns(limit: number, status?: string) {
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
      ORDER BY started_at DESC
      LIMIT $1
    `,
    [limit, status ?? null]
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
