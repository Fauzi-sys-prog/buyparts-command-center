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

type PricingRecommendationPreview = {
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

type CatalogEnrichmentPreview = {
  id: string;
  externalProductId: string;
  status: string;
  provider: string | null;
  promptVersion: string | null;
  createdAt: string;
  completedAt: string | null;
};

type AlertPreview = {
  id: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  title: string;
  detail: string | null;
  createdAt: string;
};

type SyncRunPreview = {
  id: string;
  connector: string;
  resourceType: string;
  triggerType: string;
  status: string;
  externalReference: string | null;
  startedAt: string;
  finishedAt: string | null;
};

type IntegrationSummary = {
  total: number;
  configured: number;
  partiallyConfigured: number;
  needsManualSetup: number;
  codeReady: number;
};

export type DashboardSummary = {
  mode: "live" | "preview" | "degraded";
  generatedAt: string;
  metrics: DashboardMetricSnapshot;
  syncHealth: SyncHealthSnapshot;
  recentPricingRecommendations: PricingRecommendationPreview[];
  recentCatalogEnrichmentRuns: CatalogEnrichmentPreview[];
  recentAlerts: AlertPreview[];
  recentSyncRuns: SyncRunPreview[];
  integrationSummary: IntegrationSummary;
  reason?: string;
};

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/dashboard/summary`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }

    return (await response.json()) as DashboardSummary;
  } catch (error) {
    return getFallbackDashboardSummary(
      error instanceof Error ? error.message : "Dashboard API is unavailable."
    );
  }
}
