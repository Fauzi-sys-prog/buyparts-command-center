export type ApiMode = "live" | "preview" | "degraded";

type DashboardMetricSnapshot = {
  trackedProducts: number;
  trackedVariants: number;
  totalOrders: number;
  openAlerts: number;
  pendingPricingRecommendations: number;
  pendingCatalogEnrichmentRuns: number;
};

type SyncHealthSnapshot = {
  totalRunsLast24h: number;
  successfulRunsLast24h: number;
  successRateLast24h: number | null;
  lastSyncAt: string | null;
};

export type PricingRecommendationPreview = {
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

export type CatalogEnrichmentPreview = {
  id: string;
  externalProductId: string;
  status: string;
  provider: string | null;
  promptVersion: string | null;
  createdAt: string;
  completedAt: string | null;
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

export type CatalogRunDetail = {
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

export type AlertPreview = {
  id: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  title: string;
  detail: string | null;
  createdAt: string;
};

export type SyncRunPreview = {
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

export type IntegrationSummary = {
  total: number;
  configured: number;
  partiallyConfigured: number;
  needsManualSetup: number;
  codeReady: number;
};

export type IntegrationReadinessItem = {
  id: string;
  name: string;
  category: string;
  status: "configured" | "partially_configured" | "needs_manual_setup" | "code_ready";
  summary: string;
  requiredEnv: string[];
  optionalEnv: string[];
  missingEnv: string[];
  configuredEnv: string[];
  manualSteps: string[];
};

export type IntegrationReadinessResponse = {
  items: IntegrationReadinessItem[];
  summary: IntegrationSummary;
};

export type ShopifyStatusResponse = {
  connector: string;
  status: {
    storeDomainConfigured: boolean;
    adminTokenConfigured: boolean;
    warehouseConfigured: boolean;
    projectPhase: string;
  };
  endpoints: string[];
};

export type DashboardSummary = {
  mode: ApiMode;
  generatedAt: string;
  metrics: DashboardMetricSnapshot;
  syncHealth: SyncHealthSnapshot;
  recentPricingRecommendations: PricingRecommendationPreview[];
  recentCatalogEnrichmentRuns: CatalogEnrichmentPreview[];
  recentActivity: ActivityFeedItem[];
  recentAlerts: AlertPreview[];
  recentSyncRuns: SyncRunPreview[];
  integrationSummary: IntegrationSummary;
  reason?: string;
};

export type ListResponse<T> = {
  mode: ApiMode;
  total: number;
  items: T[];
  reason?: string;
};

export type ItemResponse<T> = {
  mode: ApiMode;
  item: T | null;
  reason?: string;
  notFound?: boolean;
};

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function fetchApi<T>(path: string, fallback: T, params?: Record<string, string | number | undefined>) {
  try {
    const response = await fetch(buildUrl(path, params), {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function getFallbackDashboardSummary(reason: string): DashboardSummary {
  return {
    mode: "preview",
    generatedAt: new Date().toISOString(),
    metrics: {
      trackedProducts: 0,
      trackedVariants: 0,
      totalOrders: 0,
      openAlerts: 0,
      pendingPricingRecommendations: 0,
      pendingCatalogEnrichmentRuns: 0
    },
    syncHealth: {
      totalRunsLast24h: 0,
      successfulRunsLast24h: 0,
      successRateLast24h: null,
      lastSyncAt: null
    },
    recentPricingRecommendations: [],
    recentCatalogEnrichmentRuns: [],
    recentActivity: [],
    recentAlerts: [],
    recentSyncRuns: [],
    integrationSummary: {
      total: 0,
      configured: 0,
      partiallyConfigured: 0,
      needsManualSetup: 0,
      codeReady: 0
    },
    reason
  };
}

function getFallbackList<T>(reason: string): ListResponse<T> {
  return {
    mode: "preview",
    total: 0,
    items: [],
    reason
  };
}

function getFallbackReadiness(): IntegrationReadinessResponse {
  return {
    items: [],
    summary: {
      total: 0,
      configured: 0,
      partiallyConfigured: 0,
      needsManualSetup: 0,
      codeReady: 0
    }
  };
}

function getFallbackShopifyStatus(): ShopifyStatusResponse {
  return {
    connector: "shopify",
    status: {
      storeDomainConfigured: false,
      adminTokenConfigured: false,
      warehouseConfigured: false,
      projectPhase: "shopify-first"
    },
    endpoints: []
  };
}

function getFallbackItem<T>(reason: string): ItemResponse<T> {
  return {
    mode: "preview",
    item: null,
    reason
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchApi(
    "/dashboard/summary",
    getFallbackDashboardSummary("Dashboard API is unavailable.")
  );
}

export async function getPricingRecommendations(limit = 12, status?: string) {
  return fetchApi<ListResponse<PricingRecommendationPreview>>(
    "/pricing/recommendations",
    getFallbackList("Pricing API is unavailable."),
    { limit, status }
  );
}

export async function getCatalogEnrichmentRuns(limit = 12, status?: string) {
  return fetchApi<ListResponse<CatalogEnrichmentPreview>>(
    "/catalog/enrichment-runs",
    getFallbackList("Catalog API is unavailable."),
    { limit, status }
  );
}

export async function getAlerts(limit = 12, status?: string) {
  return fetchApi<ListResponse<AlertPreview>>("/alerts", getFallbackList("Alerts API is unavailable."), {
    limit,
    status
  });
}

export async function getSkuOverview(limit = 12) {
  return fetchApi<ListResponse<SkuOverviewItem>>("/sku/overview", getFallbackList("SKU API is unavailable."), {
    limit
  });
}

export async function getSyncRuns(limit = 12, status?: string, connector?: string) {
  return fetchApi<ListResponse<SyncRunPreview>>(
    "/integrations/sync-runs",
    getFallbackList("Sync runs API is unavailable."),
    { limit, status, connector }
  );
}

export async function getIntegrationReadiness() {
  return fetchApi<IntegrationReadinessResponse>(
    "/integrations/readiness",
    getFallbackReadiness()
  );
}

export async function getShopifyStatus() {
  return fetchApi<ShopifyStatusResponse>(
    "/integrations/shopify/status",
    getFallbackShopifyStatus()
  );
}

export async function getSkuDetail(externalVariantId: string): Promise<ItemResponse<SkuDetail>> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/sku/variants/${encodeURIComponent(externalVariantId)}`,
      {
        cache: "no-store"
      }
    );

    if (response.status === 404) {
      const payload = (await response.json()) as ItemResponse<SkuDetail>;

      return {
        mode: payload.mode,
        item: null,
        reason: payload.reason ?? "SKU detail was not found.",
        notFound: true
      };
    }

    if (!response.ok) {
      throw new Error(`SKU API returned ${response.status}`);
    }

    return (await response.json()) as ItemResponse<SkuDetail>;
  } catch (error) {
    return getFallbackItem(
      error instanceof Error ? error.message : "SKU detail API is unavailable."
    );
  }
}

export async function getCatalogRunDetail(runId: string): Promise<ItemResponse<CatalogRunDetail>> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/catalog/enrichment-runs/${encodeURIComponent(runId)}`,
      {
        cache: "no-store"
      }
    );

    if (response.status === 404) {
      const payload = (await response.json()) as ItemResponse<CatalogRunDetail>;

      return {
        mode: payload.mode,
        item: null,
        reason: payload.reason ?? "Catalog enrichment run was not found.",
        notFound: true
      };
    }

    if (!response.ok) {
      throw new Error(`Catalog run API returned ${response.status}`);
    }

    return (await response.json()) as ItemResponse<CatalogRunDetail>;
  } catch (error) {
    return getFallbackItem(
      error instanceof Error ? error.message : "Catalog run API is unavailable."
    );
  }
}
