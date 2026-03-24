import {
  getAlerts,
  getCatalogEnrichmentRuns,
  getDashboardSummary,
  getIntegrationReadiness,
  getPricingRecommendations,
  getShopifyStatus,
  getSkuOverview,
  getSyncRuns,
  type ApiMode,
  type IntegrationReadinessItem,
  type SkuOverviewItem
} from "@/lib/api";

export type ModuleRuntimeMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ModuleRuntimeItem = {
  title: string;
  detail: string;
  meta?: string;
  statusLabel?: string;
  statusTone?: "pending" | "success" | "high" | "medium" | "critical";
};

export type ModuleRuntimeSection = {
  eyebrow: string;
  title: string;
  emptyState: string;
  items: ModuleRuntimeItem[];
};

export type ModuleRuntime = {
  mode: ApiMode;
  reason?: string;
  metrics: ModuleRuntimeMetric[];
  sections: ModuleRuntimeSection[];
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `${value.toFixed(1)}%`;
}

function humanizeStatus(value: string) {
  return value.replaceAll("_", " ");
}

function mergeModes(modes: ApiMode[]): ApiMode {
  if (modes.includes("degraded")) {
    return "degraded";
  }

  if (modes.includes("preview")) {
    return "preview";
  }

  return "live";
}

function mergeReasons(reasons: Array<string | undefined>) {
  const unique = [...new Set(reasons.filter(Boolean))];
  return unique.length > 0 ? unique.join(" ") : undefined;
}

function integrationTone(status: IntegrationReadinessItem["status"]): ModuleRuntimeItem["statusTone"] {
  if (status === "configured" || status === "code_ready") {
    return "success";
  }

  if (status === "partially_configured") {
    return "medium";
  }

  return "pending";
}

function syncTone(status: string): ModuleRuntimeItem["statusTone"] {
  if (status === "success" || status === "completed") {
    return "success";
  }

  if (status === "failed") {
    return "critical";
  }

  if (status === "processing") {
    return "medium";
  }

  return "pending";
}

function inventoryTone(item: SkuOverviewItem): ModuleRuntimeItem["statusTone"] {
  if (item.availableInventory <= 2 && item.unitsSold > 0) {
    return "critical";
  }

  if (item.availableInventory <= 5 && item.unitsSold > 0) {
    return "high";
  }

  if (item.unitsSold === 0 && item.availableInventory > 0) {
    return "medium";
  }

  return "success";
}

function inventoryLabel(item: SkuOverviewItem) {
  if (item.availableInventory <= 2 && item.unitsSold > 0) {
    return "critical stock";
  }

  if (item.availableInventory <= 5 && item.unitsSold > 0) {
    return "low stock";
  }

  if (item.unitsSold === 0 && item.availableInventory > 0) {
    return "stale stock";
  }

  return "healthy";
}

function buildBaseRuntime(): ModuleRuntime {
  return {
    mode: "preview",
    metrics: [],
    sections: []
  };
}

export async function getModuleRuntime(slug: string): Promise<ModuleRuntime> {
  switch (slug) {
    case "sku-intelligence": {
      const [summary, skuOverview] = await Promise.all([getDashboardSummary(), getSkuOverview(12)]);

      return {
        mode: mergeModes([summary.mode, skuOverview.mode]),
        reason: mergeReasons([summary.reason, skuOverview.reason]),
        metrics: [
          {
            label: "Tracked variants",
            value: formatCount(summary.metrics.trackedVariants),
            detail: "Variants currently available for SKU-level analysis"
          },
          {
            label: "Orders synced",
            value: formatCount(summary.metrics.totalOrders),
            detail: "Order history backing velocity calculations"
          },
          {
            label: "Pricing queue",
            value: formatCount(summary.metrics.pendingPricingRecommendations),
            detail: "Variants already flagged for pricing review"
          }
        ],
        sections: [
          {
            eyebrow: "Live board",
            title: "Top SKU movers",
            emptyState: "No SKU records are available yet. Sync Shopify data first.",
            items: skuOverview.items.map((item) => ({
              title: item.sku ?? item.externalVariantId,
              detail: `${item.productTitle} · ${formatCount(item.availableInventory)} on hand · ${formatCount(item.unitsSold30d)} sold in the last 30 days`,
              meta: `Orders ${formatCount(item.ordersCount)} · Price ${formatCurrency(item.currentPrice)} · Last order ${formatDate(item.lastOrderedAt)}`,
              statusLabel: inventoryLabel(item),
              statusTone: inventoryTone(item)
            }))
          },
          {
            eyebrow: "Action queue",
            title: "Coverage and enrichment gaps",
            emptyState: "No SKU gaps detected yet.",
            items: skuOverview.items
              .filter((item) => item.pricingStatus !== null || item.catalogStatus !== "completed")
              .slice(0, 8)
              .map((item) => ({
                title: item.sku ?? item.externalVariantId,
                detail: `Pricing ${item.pricingStatus ?? "not queued"} · Catalog ${item.catalogStatus ?? "not started"}`,
                meta: `Recommended ${formatCurrency(item.recommendedPrice)} · Provider ${item.catalogProvider ?? "not configured"}`,
                statusLabel:
                  item.catalogStatus === "pending_provider_config"
                    ? "provider blocked"
                    : item.pricingStatus ?? item.catalogStatus ?? "pending",
                statusTone:
                  item.catalogStatus === "pending_provider_config"
                    ? "pending"
                    : item.pricingStatus === "pending"
                      ? "pending"
                      : "medium"
              }))
          }
        ]
      };
    }

    case "inventory-control": {
      const [summary, skuOverview] = await Promise.all([getDashboardSummary(), getSkuOverview(16)]);
      const lowStock = [...skuOverview.items]
        .sort((left, right) => left.availableInventory - right.availableInventory || right.unitsSold30d - left.unitsSold30d)
        .slice(0, 8);
      const staleStock = skuOverview.items
        .filter((item) => item.availableInventory > 0 && item.unitsSold === 0)
        .sort((left, right) => right.availableInventory - left.availableInventory)
        .slice(0, 8);

      return {
        mode: mergeModes([summary.mode, skuOverview.mode]),
        reason: mergeReasons([summary.reason, skuOverview.reason]),
        metrics: [
          {
            label: "Tracked variants",
            value: formatCount(summary.metrics.trackedVariants),
            detail: "Inventory candidates currently monitored"
          },
          {
            label: "Low-stock movers",
            value: formatCount(lowStock.filter((item) => item.unitsSold > 0 && item.availableInventory <= 5).length),
            detail: "SKUs most likely to need replenishment next"
          },
          {
            label: "Open alerts",
            value: formatCount(summary.metrics.openAlerts),
            detail: "Operational exceptions already raised in the system"
          }
        ],
        sections: [
          {
            eyebrow: "Risk board",
            title: "Low stock movers",
            emptyState: "No inventory records are available yet.",
            items: lowStock.map((item) => ({
              title: item.sku ?? item.externalVariantId,
              detail: `${item.productTitle} · ${formatCount(item.availableInventory)} available · ${formatCount(item.unitsSold30d)} sold / 30d`,
              meta: `Orders ${formatCount(item.ordersCount)} · Last order ${formatDate(item.lastOrderedAt)}`,
              statusLabel: inventoryLabel(item),
              statusTone: inventoryTone(item)
            }))
          },
          {
            eyebrow: "Risk board",
            title: "Stale stocked items",
            emptyState: "No stale stock has been detected yet.",
            items: staleStock.map((item) => ({
              title: item.sku ?? item.externalVariantId,
              detail: `${item.productTitle} · ${formatCount(item.availableInventory)} still on hand with no sales yet`,
              meta: `Current price ${formatCurrency(item.currentPrice)} · Pricing ${item.pricingStatus ?? "not queued"}`,
              statusLabel: "stale stock",
              statusTone: "medium"
            }))
          }
        ]
      };
    }

    case "pricing-engine": {
      const [summary, pricing] = await Promise.all([getDashboardSummary(), getPricingRecommendations(12)]);

      return {
        mode: mergeModes([summary.mode, pricing.mode]),
        reason: mergeReasons([summary.reason, pricing.reason]),
        metrics: [
          {
            label: "Pending recommendations",
            value: formatCount(summary.metrics.pendingPricingRecommendations),
            detail: "Recommendations waiting for approval or follow-up"
          },
          {
            label: "Tracked variants",
            value: formatCount(summary.metrics.trackedVariants),
            detail: "Variants already available for future pricing rules"
          },
          {
            label: "Sync success 24h",
            value: formatPercent(summary.syncHealth.successRateLast24h),
            detail: "Recent reliability of inbound sync activity"
          }
        ],
        sections: [
          {
            eyebrow: "Queue",
            title: "Recommendation batch",
            emptyState: "No pricing recommendations are queued yet.",
            items: pricing.items.map((item) => ({
              title: item.sku ?? item.externalVariantId,
              detail: `${formatCurrency(item.currentPrice)} to ${formatCurrency(item.recommendedPrice)}`,
              meta: `Confidence ${formatPercent(item.confidenceScore)} · Change ${formatPercent(item.changePercent)} · Created ${formatDate(item.createdAt)}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: syncTone(item.status)
            }))
          }
        ]
      };
    }

    case "catalog-ai": {
      const [summary, runs] = await Promise.all([getDashboardSummary(), getCatalogEnrichmentRuns(12)]);
      const providerBlocked = runs.items.filter((item) => item.status === "pending_provider_config");

      return {
        mode: mergeModes([summary.mode, runs.mode]),
        reason: mergeReasons([summary.reason, runs.reason]),
        metrics: [
          {
            label: "Pending runs",
            value: formatCount(summary.metrics.pendingCatalogEnrichmentRuns),
            detail: "Catalog jobs waiting for a provider or review step"
          },
          {
            label: "Provider blocked",
            value: formatCount(providerBlocked.length),
            detail: "Runs that will move as soon as an LLM key is configured"
          },
          {
            label: "Tracked products",
            value: formatCount(summary.metrics.trackedProducts),
            detail: "Products that can eventually flow into enrichment"
          }
        ],
        sections: [
          {
            eyebrow: "Queue",
            title: "Recent enrichment runs",
            emptyState: "No enrichment runs are available yet.",
            items: runs.items.map((item) => ({
              title: item.externalProductId,
              detail: `Provider ${item.provider ?? "not configured"} · Prompt ${item.promptVersion ?? "pending"}`,
              meta: `Created ${formatDate(item.createdAt)}${item.completedAt ? ` · Completed ${formatDate(item.completedAt)}` : ""}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: item.status === "pending_provider_config" ? "pending" : syncTone(item.status)
            }))
          }
        ]
      };
    }

    case "integrations": {
      const [summary, readiness, syncRuns, shopifyStatus] = await Promise.all([
        getDashboardSummary(),
        getIntegrationReadiness(),
        getSyncRuns(12),
        getShopifyStatus()
      ]);

      return {
        mode: mergeModes([summary.mode, readiness.items.length > 0 ? "live" : "preview", syncRuns.mode]),
        reason: mergeReasons([summary.reason, syncRuns.reason]),
        metrics: [
          {
            label: "Configured",
            value: formatCount(readiness.summary.configured),
            detail: "Connectors already wired with working credentials"
          },
          {
            label: "Manual setup",
            value: formatCount(readiness.summary.needsManualSetup),
            detail: "Integrations still waiting on signup or API keys"
          },
          {
            label: "Sync success 24h",
            value: formatPercent(summary.syncHealth.successRateLast24h),
            detail: "Recent reliability across connector ingestion"
          }
        ],
        sections: [
          {
            eyebrow: "Connections",
            title: "Connector readiness",
            emptyState: "No integration readiness data is available yet.",
            items: readiness.items.map((item) => ({
              title: item.name,
              detail: item.summary,
              meta:
                item.missingEnv.length > 0
                  ? `Missing ${item.missingEnv.join(", ")}`
                  : `Configured env ${item.configuredEnv.join(", ") || "none"}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: integrationTone(item.status)
            }))
          },
          {
            eyebrow: "Activity",
            title: "Recent sync runs",
            emptyState: "No sync runs have been recorded yet.",
            items: syncRuns.items.map((item) => ({
              title: `${item.connector} · ${item.resourceType}`,
              detail: `${item.triggerType} trigger${item.externalReference ? ` · Ref ${item.externalReference}` : ""}`,
              meta: `Started ${formatDate(item.startedAt)}${item.finishedAt ? ` · Finished ${formatDate(item.finishedAt)}` : ""}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: syncTone(item.status)
            }))
          },
          {
            eyebrow: "Commerce",
            title: "Shopify connector",
            emptyState: "Shopify status is not available yet.",
            items: [
              {
                title: "Shopify-first phase",
                detail: `Store domain ${shopifyStatus.status.storeDomainConfigured ? "configured" : "missing"} · Admin token ${shopifyStatus.status.adminTokenConfigured ? "configured" : "missing"}`,
                meta: `Warehouse ${shopifyStatus.status.warehouseConfigured ? "connected" : "not connected"} · Phase ${shopifyStatus.status.projectPhase}`,
                statusLabel: shopifyStatus.status.adminTokenConfigured ? "ready" : "setup needed",
                statusTone: shopifyStatus.status.adminTokenConfigured ? "success" : "pending"
              }
            ]
          }
        ]
      };
    }

    case "alerts": {
      const [summary, alerts] = await Promise.all([getDashboardSummary(), getAlerts(12)]);

      return {
        mode: mergeModes([summary.mode, alerts.mode]),
        reason: mergeReasons([summary.reason, alerts.reason]),
        metrics: [
          {
            label: "Open alerts",
            value: formatCount(summary.metrics.openAlerts),
            detail: "Current alert volume waiting for triage"
          },
          {
            label: "Sync runs 24h",
            value: formatCount(summary.syncHealth.totalRunsLast24h),
            detail: "Recent ingestion activity that can generate exceptions"
          },
          {
            label: "Success rate",
            value: formatPercent(summary.syncHealth.successRateLast24h),
            detail: "A healthy sync rate usually keeps alert volume low"
          }
        ],
        sections: [
          {
            eyebrow: "Queue",
            title: "Recent operational alerts",
            emptyState: "No alerts are open yet.",
            items: alerts.items.map((item) => ({
              title: item.title,
              detail: `${item.source} · ${item.type} · ${item.status}`,
              meta: `${item.detail ?? "No extra detail yet."} · Created ${formatDate(item.createdAt)}`,
              statusLabel: item.severity,
              statusTone:
                item.severity === "critical"
                  ? "critical"
                  : item.severity === "high"
                    ? "high"
                    : item.severity === "medium"
                      ? "medium"
                      : "success"
            }))
          }
        ]
      };
    }

    case "growth-ads": {
      const readiness = await getIntegrationReadiness();
      const relevant = readiness.items.filter((item) =>
        ["bigquery", "google-ads", "merchant-center"].includes(item.id)
      );

      return {
        mode: relevant.length > 0 ? "live" : "preview",
        metrics: [
          {
            label: "Growth connectors",
            value: formatCount(relevant.length),
            detail: "Dependencies for BigQuery, Ads, and Merchant Center"
          },
          {
            label: "Configured now",
            value: formatCount(relevant.filter((item) => item.status === "configured").length),
            detail: "Connectors already ready for live wiring"
          },
          {
            label: "Manual setup left",
            value: formatCount(relevant.filter((item) => item.status === "needs_manual_setup").length),
            detail: "Accounts or keys still needed before activation"
          }
        ],
        sections: [
          {
            eyebrow: "Foundations",
            title: "Growth stack readiness",
            emptyState: "Growth connector readiness is not available yet.",
            items: relevant.map((item) => ({
              title: item.name,
              detail: item.summary,
              meta:
                item.missingEnv.length > 0
                  ? `Missing ${item.missingEnv.join(", ")}`
                  : `Configured env ${item.configuredEnv.join(", ") || "none"}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: integrationTone(item.status)
            }))
          }
        ]
      };
    }

    case "settings": {
      const readiness = await getIntegrationReadiness();
      const missingItems = readiness.items.filter((item) => item.missingEnv.length > 0);

      return {
        mode: readiness.items.length > 0 ? "live" : "preview",
        metrics: [
          {
            label: "Configured",
            value: formatCount(readiness.summary.configured),
            detail: "Systems already wired for this environment"
          },
          {
            label: "Needs setup",
            value: formatCount(readiness.summary.needsManualSetup),
            detail: "Integrations still waiting on credentials"
          },
          {
            label: "Code ready",
            value: formatCount(readiness.summary.codeReady),
            detail: "Local tooling ready before external account setup"
          }
        ],
        sections: [
          {
            eyebrow: "Configuration",
            title: "Missing environment groups",
            emptyState: "No missing environment groups are left.",
            items: missingItems.map((item) => ({
              title: item.name,
              detail: item.summary,
              meta: `Missing ${item.missingEnv.join(", ")}`,
              statusLabel: humanizeStatus(item.status),
              statusTone: integrationTone(item.status)
            }))
          }
        ]
      };
    }

    default:
      return buildBaseRuntime();
  }
}
