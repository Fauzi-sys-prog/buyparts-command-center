import { ActionFeedbackBanner } from "@/components/action-feedback-banner";
import { CatalogRunActions } from "@/components/catalog-run-actions";
import { PricingReviewActions } from "@/components/pricing-review-actions";
import Link from "next/link";

import type { ActionFeedback } from "@/lib/action-feedback";
import type { ActivityFeedItem } from "@/lib/api";
import {
  getCatalogEnrichmentRuns,
  getDashboardSummary,
  getIntegrationReadiness,
  getPricingRecommendations
} from "@/lib/api";

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

function formatPercent(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `${value.toFixed(1)}%`;
}

function formatRatio(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `${value.toFixed(2)}x`;
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

function humanizeValue(value: string | null | undefined) {
  if (!value) {
    return "unknown";
  }

  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join("") || "BP"
  );
}

function buildLinePath(points: number[], width: number, height: number, padding = 18) {
  if (points.length === 0) {
    return "";
  }

  const maxValue = Math.max(...points);
  const minValue = Math.min(...points);
  const range = Math.max(maxValue - minValue, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return points
    .map((point, index) => {
      const x = padding + (innerWidth * index) / Math.max(points.length - 1, 1);
      const normalized = (point - minValue) / range;
      const y = height - padding - normalized * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(points: number[], width: number, height: number, padding = 18) {
  if (points.length === 0) {
    return "";
  }

  const linePath = buildLinePath(points, width, height, padding);
  const innerWidth = width - padding * 2;
  const baselineY = height - padding;
  const lastX = padding + innerWidth;

  return `${linePath} L ${lastX.toFixed(2)} ${baselineY.toFixed(2)} L ${padding.toFixed(
    2
  )} ${baselineY.toFixed(2)} Z`;
}

function getActivityHref(item: ActivityFeedItem) {
  if (item.targetKind === "catalog_run") {
    return `/catalog/runs/${encodeURIComponent(item.targetId)}`;
  }

  return `/sku/${encodeURIComponent(item.targetId)}`;
}

function getModeLabel(mode: "live" | "preview" | "degraded") {
  if (mode === "live") {
    return "Warehouse live";
  }

  if (mode === "degraded") {
    return "Partial data";
  }

  return "Preview mode";
}

type DashboardHomeProps = {
  feedback?: ActionFeedback | null;
  range?: "24h" | "7d" | "30d";
  filters?: {
    pricingQ?: string;
    pricingStatus?: string;
    catalogQ?: string;
    catalogStatus?: string;
  };
};

function buildRangeHref(range: "24h" | "7d" | "30d") {
  return `/?range=${encodeURIComponent(range)}`;
}

function mapIntegrationStatus(status: "configured" | "partially_configured" | "needs_manual_setup" | "code_ready") {
  if (status === "configured") {
    return {
      label: "Configured",
      tone: "success"
    };
  }

  if (status === "partially_configured") {
    return {
      label: "Partial",
      tone: "medium"
    };
  }

  if (status === "code_ready") {
    return {
      label: "Code ready",
      tone: "queued"
    };
  }

  return {
    label: "Needs setup",
    tone: "pending"
  };
}

export async function DashboardHome({ feedback = null, range = "7d" }: DashboardHomeProps) {
  const [summary, pricing, catalog, readiness] = await Promise.all([
    getDashboardSummary(),
    getPricingRecommendations(8),
    getCatalogEnrichmentRuns(8),
    getIntegrationReadiness()
  ]);

  const pendingPricing = pricing.items.filter((item) => item.status === "pending");
  const activeCatalog = catalog.items.filter((item) => item.status !== "completed" && item.status !== "cancelled");
  const featuredPricing = pendingPricing[0] ?? pricing.items[0] ?? null;
  const featuredCatalog = activeCatalog[0] ?? catalog.items[0] ?? null;
  const featuredActivity = summary.recentActivity[0] ?? null;
  const pendingReviewsTotal =
    summary.metrics.pendingPricingRecommendations + summary.metrics.pendingCatalogEnrichmentRuns;
  const integrationCoverage =
    summary.integrationSummary.total > 0
      ? (summary.integrationSummary.configured / summary.integrationSummary.total) * 100
      : null;
  const manualSetupShare =
    summary.integrationSummary.total > 0
      ? (summary.integrationSummary.needsManualSetup / summary.integrationSummary.total) * 100
      : null;
  const orderDensity =
    summary.metrics.trackedVariants > 0
      ? summary.metrics.totalOrders / summary.metrics.trackedVariants
      : null;
  const reviewBacklogRate =
    summary.metrics.trackedVariants > 0
      ? (pendingReviewsTotal / summary.metrics.trackedVariants) * 100
      : null;
  const pricingWorkloadShare =
    pendingReviewsTotal > 0
      ? (summary.metrics.pendingPricingRecommendations / pendingReviewsTotal) * 100
      : 0;
  const catalogWorkloadShare =
    pendingReviewsTotal > 0
      ? (summary.metrics.pendingCatalogEnrichmentRuns / pendingReviewsTotal) * 100
      : 0;
  const rangeConfig = {
    "24h": {
      label: "24h",
      subtitle: "Operational today",
      xLabels: ["00h", "04h", "08h", "12h", "16h", "20h"],
      trendWeights: [0.34, 0.46, 0.41, 0.62, 0.78, 0.69]
    },
    "7d": {
      label: "7d",
      subtitle: "This week",
      xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      trendWeights: [0.28, 0.4, 0.58, 0.49, 0.72, 0.88]
    },
    "30d": {
      label: "30d",
      subtitle: "Month view",
      xLabels: ["W1", "W2", "W3", "W4", "W5", "Now"],
      trendWeights: [0.24, 0.36, 0.33, 0.61, 0.78, 0.96]
    }
  } as const;
  const selectedRange = rangeConfig[range];

  const executiveStats = [
    {
      tone: "navy",
      label: "Tracked Variants",
      value: formatCount(summary.metrics.trackedVariants),
      detail: "SKU candidates available for pricing and operations.",
      href: "/modules/sku-intelligence"
    },
    {
      tone: "green",
      label: "Orders Synced",
      value: formatCount(summary.metrics.totalOrders),
      detail: "Order records already normalized into PostgreSQL.",
      href: "/modules/integrations"
    },
    {
      tone: "amber",
      label: "Pending Reviews",
      value: formatCount(
        summary.metrics.pendingPricingRecommendations + summary.metrics.pendingCatalogEnrichmentRuns
      ),
      detail: "Open pricing and catalog tasks waiting for operator attention.",
      href: "/modules/alerts"
    },
    {
      tone: "blue",
      label: "Sync Success",
      value: formatPercent(summary.syncHealth.successRateLast24h),
      detail:
        summary.syncHealth.totalRunsLast24h > 0
          ? `${summary.syncHealth.successfulRunsLast24h}/${summary.syncHealth.totalRunsLast24h} successful runs in the last 24 hours.`
          : "No sync runs have landed in the last 24 hours yet.",
      href: "/modules/integrations"
    }
  ];

  const quickLinks = [
    {
      label: "Open Dashboard Queue",
      detail:
        pendingPricing.length > 0
          ? `${formatCount(pendingPricing.length)} pricing approvals waiting`
          : "Jump into the live pricing queue",
      href: "/modules/pricing-engine",
      tone: "navy"
    },
    {
      label: "Review Catalog Run",
      detail:
        featuredCatalog !== null
          ? `Latest run ${featuredCatalog.externalProductId}`
          : "Open the catalog review surface",
      href: featuredCatalog ? `/catalog/runs/${encodeURIComponent(featuredCatalog.id)}` : "/modules/catalog-ai",
      tone: "blue"
    },
    {
      label: "Open Live SKU",
      detail:
        featuredPricing !== null
          ? `Spotlight ${featuredPricing.sku ?? featuredPricing.externalVariantId}`
          : "Open the SKU intelligence view",
      href: featuredPricing ? `/sku/${encodeURIComponent(featuredPricing.externalVariantId)}` : "/modules/sku-intelligence",
      tone: "green"
    },
    {
      label: "Setup Readiness",
      detail: `${formatCount(summary.integrationSummary.needsManualSetup)} integrations still need credentials`,
      href: "/modules/settings",
      tone: "amber"
    }
  ];

  const snapshotRows = [
    {
      label: "Current environment",
      value: getModeLabel(summary.mode)
    },
    {
      label: "Last sync",
      value: formatDate(summary.syncHealth.lastSyncAt)
    },
    {
      label: "Latest pricing focus",
      value: featuredPricing ? featuredPricing.sku ?? featuredPricing.externalVariantId : "No pricing seed yet"
    },
    {
      label: "Latest activity",
      value: featuredActivity ? featuredActivity.summary : "No operator activity yet"
    }
  ];

  const heroMeta = [
    {
      label: "Runtime",
      value: "PostgreSQL-backed"
    },
    {
      label: "Workflow",
      value: "Operator approvals live"
    },
    {
      label: "Ingestion",
      value: "Shopify-ready foundation"
    }
  ];

  const heroSpotlights = [
    {
      tone: "navy",
      label: "Pricing spotlight",
      value: featuredPricing ? featuredPricing.sku ?? featuredPricing.externalVariantId : "Queue warming up",
      detail:
        pendingPricing.length > 0
          ? `${formatCount(pendingPricing.length)} recommendations ready for operator review`
          : "No pending recommendations are waiting right now."
    },
    {
      tone: "green",
      label: "Catalog spotlight",
      value: featuredCatalog ? featuredCatalog.externalProductId : "Review lane idle",
      detail:
        activeCatalog.length > 0
          ? `${formatCount(activeCatalog.length)} active enrichment runs in the review lane`
          : "Catalog review will fill in as soon as new runs are persisted."
    },
    {
      tone: "blue",
      label: "Operator pulse",
      value: featuredActivity ? humanizeValue(featuredActivity.scope) : "No recent action",
      detail: featuredActivity ? featuredActivity.summary : "The activity feed will populate after the next review action."
    }
  ];

  const readinessGoal = Math.max(
    integrationCoverage ?? 0,
    summary.syncHealth.successRateLast24h ?? 0
  );

  const analyticsTopCards = [
    {
      label: "Revenue posture",
      value: formatRatio(orderDensity),
      detail: "Orders per tracked variant across the current operating dataset.",
      linkLabel: "Commerce pulse",
      tone: "blue"
    },
    {
      label: "Review leakage",
      value: formatPercent(reviewBacklogRate),
      detail: `${formatCount(pendingReviewsTotal)} open review items still waiting on operator decisions.`,
      linkLabel: "Open review queue",
      tone: "default"
    }
  ];

  const chartSignalBase = Math.max(
    summary.metrics.totalOrders * 16 +
      pendingReviewsTotal * 11 +
      summary.integrationSummary.configured * 9 +
      summary.metrics.openAlerts * 6,
    20
  );
  const analyticsSeries = selectedRange.xLabels.map((label, index) => ({
    label,
    value: Math.round(chartSignalBase * selectedRange.trendWeights[index])
  }));

  const analyticsValues = analyticsSeries.map((item) => item.value);
  const analyticsLinePath = buildLinePath(analyticsValues, 480, 220, 22);
  const analyticsAreaPath = buildAreaPath(analyticsValues, 480, 220, 22);
  const analyticsPeak = analyticsSeries.reduce((current, item) =>
    item.value > current.value ? item : current
  );

  const analyticsFeed = [
    ...(pendingPricing.slice(0, 2).map((item) => ({
      id: `pricing-${item.id}`,
      title: item.sku ?? item.externalVariantId,
      subtitle: "Pricing review lane",
      detail: `${formatCurrency(item.currentPrice)} -> ${formatCurrency(item.recommendedPrice)}`,
      meta: `Confidence ${formatPercent(item.confidenceScore)}`,
      tone: "blue"
    })) ?? []),
    ...(activeCatalog.slice(0, 1).map((item) => ({
      id: `catalog-${item.id}`,
      title: item.externalProductId,
      subtitle: "Catalog enrichment lane",
      detail: `Provider ${item.provider ?? "pending"} · Prompt ${item.promptVersion ?? "draft"}`,
      meta: `Created ${formatDate(item.createdAt)}`,
      tone: "green"
    })) ?? []),
    ...(summary.recentActivity.slice(0, 1).map((item) => ({
      id: `activity-${item.id}`,
      title: item.targetLabel,
      subtitle: "Operator pulse",
      detail: item.summary,
      meta: formatDate(item.createdAt),
      tone: "navy"
    })) ?? [])
  ].slice(0, 4);

  const analyticsBottomStats = [
    {
      label: "Peak signal",
      value: analyticsPeak.label,
      detail: `${formatCount(analyticsPeak.value)} weighted live points`
    },
    {
      label: "Quarter goal",
      value: formatPercent(readinessGoal),
      detail: "Warehouse and sync readiness blended into one progress target"
    },
    {
      label: "Lead SKU",
      value: featuredPricing?.sku ?? featuredPricing?.externalVariantId ?? "Queue idle",
      detail: featuredPricing ? "Current pricing spotlight" : "No pricing lead yet"
    }
  ];

  const pulsePeople = (
    summary.recentActivity.length > 0
      ? summary.recentActivity.slice(0, 4).map((item) => ({
          id: item.id,
          label: item.operatorLabel ?? item.targetLabel,
          caption: item.summary
        }))
      : [
          { id: "fallback-pricing", label: "Pricing", caption: "Approval signals will appear here." },
          { id: "fallback-catalog", label: "Catalog", caption: "Catalog queue actions will light up next." },
          { id: "fallback-sync", label: "Sync", caption: "Connector notes will roll in from integrations." }
        ]
  ).slice(0, 4);

  const topStates = [
    {
      label: "PR",
      value: Math.max(pricingWorkloadShare, pendingPricing.length > 0 ? 14 : 0),
      detail: `${formatCount(summary.metrics.pendingPricingRecommendations)} pricing tasks`
    },
    {
      label: "CG",
      value: Math.max(catalogWorkloadShare, activeCatalog.length > 0 ? 14 : 0),
      detail: `${formatCount(summary.metrics.pendingCatalogEnrichmentRuns)} catalog tasks`
    },
    {
      label: "IN",
      value: Math.max(integrationCoverage ?? 0, summary.integrationSummary.configured > 0 ? 16 : 0),
      detail: `${formatCount(summary.integrationSummary.configured)} integrations configured`
    }
  ];

  const analyticsRoutes = [
    {
      label: featuredPricing?.sku ?? "Pricing Engine",
      href: featuredPricing ? `/sku/${encodeURIComponent(featuredPricing.externalVariantId)}` : "/modules/pricing-engine"
    },
    {
      label: featuredCatalog?.externalProductId ?? "Catalog Review",
      href: featuredCatalog ? `/catalog/runs/${encodeURIComponent(featuredCatalog.id)}` : "/modules/catalog-ai"
    },
    {
      label: "Alerts Center",
      href: "/modules/alerts"
    },
    {
      label: "Setup Readiness",
      href: "/modules/settings"
    }
  ];
  const rangeTabs = (Object.keys(rangeConfig) as Array<keyof typeof rangeConfig>).map((item) => ({
    key: item,
    label: rangeConfig[item].label,
    subtitle: rangeConfig[item].subtitle,
    href: buildRangeHref(item),
    active: item === range
  }));
  const integrationStrip = ["shopify", "bigquery", "google-ads", "merchant-center", "supplier-api", "llm"]
    .map((id) => readiness.items.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
    .map((item) => ({
      ...item,
      badge: mapIntegrationStatus(item.status)
    }));

  const analyticsHighlights = [
    {
      label: "Review backlog rate",
      value: formatPercent(reviewBacklogRate),
      detail: `${formatCount(pendingReviewsTotal)} open reviews across ${formatCount(summary.metrics.trackedVariants)} tracked variants.`,
      tone: "blue"
    },
    {
      label: "Integration coverage",
      value: formatPercent(integrationCoverage),
      detail: `${formatCount(summary.integrationSummary.configured)} of ${formatCount(summary.integrationSummary.total)} integrations configured.`,
      tone: "green"
    },
    {
      label: "Order density",
      value: formatRatio(orderDensity),
      detail: "Orders per tracked variant in the current local dataset.",
      tone: "navy"
    },
    {
      label: "Open alerts",
      value: formatCount(summary.metrics.openAlerts),
      detail: "Operational exceptions currently surfaced to the command center.",
      tone: "amber"
    }
  ];

  const analyticsMeters = [
    {
      label: "Pricing approvals",
      value: `${formatCount(summary.metrics.pendingPricingRecommendations)} open`,
      percent: pricingWorkloadShare,
      tone: "blue",
      detail:
        pendingReviewsTotal > 0
          ? `${formatPercent(pricingWorkloadShare)} of the current review backlog.`
          : "No pricing backlog is open right now."
    },
    {
      label: "Catalog reviews",
      value: `${formatCount(summary.metrics.pendingCatalogEnrichmentRuns)} open`,
      percent: catalogWorkloadShare,
      tone: "green",
      detail:
        pendingReviewsTotal > 0
          ? `${formatPercent(catalogWorkloadShare)} of the current review backlog.`
          : "No catalog backlog is open right now."
    },
    {
      label: "Configured integrations",
      value: `${formatCount(summary.integrationSummary.configured)} ready`,
      percent: integrationCoverage ?? 0,
      tone: "navy",
      detail:
        summary.integrationSummary.total > 0
          ? `${formatPercent(integrationCoverage)} of the integration surface is already configured.`
          : "Integration readiness will appear here once connectors are registered."
    },
    {
      label: "Manual setup remaining",
      value: `${formatCount(summary.integrationSummary.needsManualSetup)} pending`,
      percent: manualSetupShare ?? 0,
      tone: "amber",
      detail:
        summary.integrationSummary.total > 0
          ? `${formatPercent(manualSetupShare)} of integrations still need credentials or provider setup.`
          : "No pending setup has been recorded yet."
    }
  ];

  return (
    <div className="page-grid executive-page">
      <section className="hero-card executive-hero">
        <div className="executive-hero-layout">
          <div className="hero-header hero-header-column">
            <div>
              <p className="eyebrow">System Operational Live</p>
              <h3 className="executive-title">
                Command Center <span className="executive-title-accent">Executive</span>
              </h3>
              <p className="executive-welcome">WELCOME TO THE BUYPARTS CONTROL ROOM</p>
              <p className="hero-copy">
                One place to monitor SKU health, review pricing recommendations, track catalog enrichment,
                and see what still needs credentials before the live stack is fully connected.
              </p>
              <div className="hero-meta-strip">
                {heroMeta.map((item) => (
                  <div key={item.label} className="hero-meta-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {feedback ? <ActionFeedbackBanner feedback={feedback} /> : null}

            {summary.reason ? (
              <div className="banner-card">
                <strong>Dashboard note</strong>
                <p>{summary.reason}</p>
              </div>
            ) : null}
          </div>

          <div className="executive-rail">
            <div className={`status-indicator hero-status-indicator is-${summary.mode}`}>
              <span>{getModeLabel(summary.mode)}</span>
              <strong>Last sync: {formatDate(summary.syncHealth.lastSyncAt)}</strong>
              <p className="hero-status-copy">
                {summary.syncHealth.totalRunsLast24h > 0
                  ? `${summary.syncHealth.successfulRunsLast24h}/${summary.syncHealth.totalRunsLast24h} successful sync runs in the last 24 hours`
                  : "No sync runs have landed in the last 24 hours yet."}
              </p>
            </div>

            <div className="hero-spotlight-grid">
              {heroSpotlights.map((item) => (
                <article key={item.label} className={`hero-spotlight-card hero-spotlight-${item.tone}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="executive-stat-grid">
        {executiveStats.map((item) => (
          <Link key={item.label} href={item.href} className={`executive-stat-card executive-stat-link stat-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
            <small>Open view</small>
          </Link>
        ))}
      </section>

      <section className="integration-health-strip">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Connector health</p>
            <h3>Integration Readiness Strip</h3>
          </div>
          <Link href="/modules/integrations" className="panel-link">
            Open integrations
          </Link>
        </div>

        <div className="integration-health-grid">
          {integrationStrip.map((item) => (
            <Link key={item.id} href="/modules/integrations" className="integration-health-card">
              <div className="integration-health-head">
                <strong>{item.name}</strong>
                <span className={`status-pill status-${item.badge.tone}`}>{item.badge.label}</span>
              </div>
              <p>{item.summary}</p>
              <small>
                {item.missingEnv.length > 0
                  ? `${formatCount(item.missingEnv.length)} env values still missing`
                  : "Core env values already present"}
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="analytics-suite-grid">
        <div className="analytics-top-strip">
          {analyticsTopCards.map((item) => (
            <article key={item.label} className={`section-card analytics-hero-card analytics-hero-${item.tone}`}>
              <div className="analytics-hero-head">
                <h3>{item.label}</h3>
              </div>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
              <span className="analytics-card-link">{item.linkLabel}</span>
            </article>
          ))}

          <article className="section-card analytics-gauge-card">
            <div className="analytics-hero-head">
              <h3>Quarter goal</h3>
            </div>
            <div className="goal-gauge-shell">
              <svg viewBox="0 0 220 132" className="goal-gauge" role="img" aria-label="Quarter goal progress">
                <path
                  d="M 30 102 A 80 80 0 0 1 190 102"
                  pathLength="100"
                  className="goal-gauge-track"
                />
                <path
                  d="M 30 102 A 80 80 0 0 1 190 102"
                  pathLength="100"
                  className="goal-gauge-progress"
                  strokeDasharray={`${Math.max(Math.min(readinessGoal, 100), 0)} 100`}
                />
              </svg>
              <div className="goal-gauge-copy">
                <strong>{formatPercent(readinessGoal)}</strong>
                <p>Combined sync health and integration readiness for the current build phase.</p>
              </div>
            </div>
            <span className="analytics-card-link">All goals</span>
          </article>
        </div>

        <div className="analytics-deep-grid">
          <article className="section-card analytics-customer-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Priority queue</p>
                <h3>Review Surface</h3>
              </div>
              <span className="chip">Live shortlist</span>
            </div>

            <div className="analytics-customer-list">
              {analyticsFeed.length > 0 ? (
                analyticsFeed.map((item, index) => (
                  <article
                    key={item.id}
                    className={`analytics-customer-item${index === 1 ? " analytics-customer-item-highlight" : ""}`}
                  >
                    <div className={`analytics-customer-avatar analytics-customer-avatar-${item.tone}`}>
                      {getInitials(item.title)}
                    </div>
                    <div className="analytics-customer-copy">
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                      <p>{item.detail}</p>
                    </div>
                    <div className="analytics-customer-meta">
                      <small>{item.meta}</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state-card">
                  <strong>No analytics feed yet.</strong>
                  <p>Once pricing, catalog, and operator activity land, the shortlist will populate here.</p>
                </div>
              )}
            </div>

            <Link href="/modules/pricing-engine" className="analytics-card-link analytics-card-link-inline">
              Open full queue
            </Link>
          </article>

          <article className="section-card analytics-growth-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Trend signal</p>
                <h3>Growth Curve</h3>
              </div>
              <div className="range-tab-row">
                {rangeTabs.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`range-tab${item.active ? " is-active" : ""}`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="analytics-chart-shell">
              <div className="analytics-chart-yaxis">
                <span>100</span>
                <span>60</span>
                <span>20</span>
                <span>0</span>
              </div>
              <div className="analytics-chart-stage">
                <svg viewBox="0 0 480 220" className="analytics-chart" role="img" aria-label="Growth curve chart">
                  <defs>
                    <linearGradient id="analyticsArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2f6df6" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#2f6df6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  <g className="analytics-chart-grid">
                    {[22, 70, 118, 166, 214].map((y) => (
                      <line key={y} x1="18" x2="462" y1={y} y2={y} />
                    ))}
                    {analyticsSeries.map((item, index) => {
                      const x = 22 + (440 * index) / Math.max(analyticsSeries.length - 1, 1);
                      return <line key={item.label} x1={x} x2={x} y1="20" y2="198" />;
                    })}
                  </g>

                  <path d={analyticsAreaPath} className="analytics-chart-area" />
                  <path d={analyticsLinePath} className="analytics-chart-line" />

                  {analyticsSeries.map((item, index) => {
                    const maxValue = Math.max(...analyticsValues);
                    const minValue = Math.min(...analyticsValues);
                    const range = Math.max(maxValue - minValue, 1);
                    const x = 22 + (440 * index) / Math.max(analyticsSeries.length - 1, 1);
                    const y = 198 - ((item.value - minValue) / range) * 176;

                    return (
                      <g key={item.label}>
                        <circle cx={x} cy={y} r="5" className="analytics-chart-dot" />
                      </g>
                    );
                  })}
                </svg>

                <div className="analytics-chart-xaxis">
                  {analyticsSeries.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="analytics-range-note">
              <span className="chip">Modeled by current snapshot</span>
              <p>{selectedRange.subtitle} view using the latest live operational state and review backlog.</p>
            </div>

            <div className="analytics-footer-stats">
              {analyticsBottomStats.map((item) => (
                <article key={item.label} className="analytics-footer-stat">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="analytics-showcase-grid">
        <article className="section-card executive-panel analytics-panel analytics-panel-primary">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operations analytics</p>
              <h3>Performance Overview</h3>
            </div>
            <span className="chip">Analytics view</span>
          </div>

          <div className="analytics-kpi-grid">
            {analyticsHighlights.map((item) => (
              <article key={item.label} className={`analytics-kpi-card analytics-kpi-${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="section-card executive-panel analytics-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workload distribution</p>
              <h3>Analytics Pulse</h3>
            </div>
          </div>

          <div className="analytics-meter-list">
            {analyticsMeters.map((item) => (
              <div key={item.label} className="analytics-meter-row">
                <div className="analytics-meter-head">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="analytics-meter-track">
                  <div
                    className={`analytics-meter-fill analytics-meter-${item.tone}`}
                    style={{ width: `${Math.max(item.percent, item.percent > 0 ? 10 : 0)}%` }}
                  />
                </div>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="executive-main-grid">
        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operational snapshot</p>
              <h3>System Snapshot</h3>
            </div>
          </div>

          <div className="snapshot-stack">
            {snapshotRows.map((item) => (
              <div key={item.label} className="snapshot-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Navigation</p>
              <h3>Quick Links</h3>
            </div>
            <Link href="/modules/settings" className="panel-link">
              View setup
            </Link>
          </div>

          <div className="quick-link-stack">
            {quickLinks.map((item) => (
              <Link key={item.label} href={item.href} className={`quick-link-button quick-link-${item.tone}`}>
                <div className="quick-link-copy">
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </div>
                <span>&gt;</span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="executive-main-grid">
        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pricing queue</p>
              <h3>Focus Review</h3>
            </div>
            <Link href="/modules/pricing-engine" className="panel-link">
              Manage
            </Link>
          </div>

          <div className="focus-stack">
            {pendingPricing.length > 0 ? (
              pendingPricing.slice(0, 3).map((item) => (
                <div key={item.id} className="focus-item">
                  <div className="focus-item-header">
                    <div>
                      <strong>{item.sku ?? item.externalVariantId}</strong>
                      <p>
                        {formatCurrency(item.currentPrice)} to {formatCurrency(item.recommendedPrice)}
                      </p>
                    </div>
                    <span className={`status-pill status-${item.status}`}>{humanizeValue(item.status)}</span>
                  </div>
                  <small className="list-meta">
                    Confidence {formatPercent(item.confidenceScore)} · Change {formatPercent(item.changePercent)}
                  </small>
                  <div className="focus-item-actions">
                    <PricingReviewActions recommendationId={item.id} returnPath="/" />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-card">
                <strong>No pending pricing queue yet.</strong>
                <p>As soon as worker output lands, the highest-priority pricing items will show up here.</p>
              </div>
            )}
          </div>
        </article>

        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog queue</p>
              <h3>Enrichment Review</h3>
            </div>
            <Link href="/modules/catalog-ai" className="panel-link">
              Manage
            </Link>
          </div>

          <div className="focus-stack">
            {activeCatalog.length > 0 ? (
              activeCatalog.slice(0, 3).map((item) => (
                <div key={item.id} className="focus-item">
                  <div className="focus-item-header">
                    <div>
                      <strong>{item.externalProductId}</strong>
                      <p>
                        Provider {item.provider ?? "not configured"} · Prompt {item.promptVersion ?? "pending"}
                      </p>
                    </div>
                    <span className={`status-pill status-${item.status}`}>{humanizeValue(item.status)}</span>
                  </div>
                  <small className="list-meta">Created {formatDate(item.createdAt)}</small>
                  <div className="focus-item-actions">
                    <CatalogRunActions runId={item.id} returnPath="/" />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-card">
                <strong>No active catalog queue yet.</strong>
                <p>The seeded catalog review items will appear here once the worker persists its first run batch.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="executive-main-grid">
        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent decisions</p>
              <h3>Operator Activity</h3>
            </div>
            <Link href="/modules/alerts" className="panel-link">
              Open
            </Link>
          </div>

          <div className="focus-stack">
            {summary.recentActivity.length > 0 ? (
              summary.recentActivity.slice(0, 4).map((item) => (
                <Link key={item.id} href={getActivityHref(item)} className="focus-item focus-link-card">
                  <div className="focus-item-header">
                    <div>
                      <strong>{item.targetLabel}</strong>
                      <p>{item.summary}</p>
                    </div>
                    <span className={`status-pill status-${item.scope === "pricing" ? "medium" : "queued"}`}>
                      {humanizeValue(item.scope)}
                    </span>
                  </div>
                  <small className="list-meta">
                    {humanizeValue(item.eventType)} · {formatDate(item.createdAt)}
                  </small>
                </Link>
              ))
            ) : (
              <div className="empty-state-card">
                <strong>No operator history yet.</strong>
                <p>Approvals, queue actions, and saved review workspaces will appear here automatically.</p>
              </div>
            )}
          </div>
        </article>

        <article className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Readiness</p>
              <h3>Platform Status</h3>
            </div>
            <Link href="/modules/settings" className="panel-link">
              Open
            </Link>
          </div>

          <div className="snapshot-stack">
            <div className="snapshot-row">
              <span>Configured integrations</span>
              <strong>{formatCount(summary.integrationSummary.configured)}</strong>
            </div>
            <div className="snapshot-row">
              <span>Manual setup remaining</span>
              <strong>{formatCount(summary.integrationSummary.needsManualSetup)}</strong>
            </div>
            <div className="snapshot-row">
              <span>Code-ready connectors</span>
              <strong>{formatCount(summary.integrationSummary.codeReady)}</strong>
            </div>
            <div className="snapshot-row">
              <span>Recent sync runs</span>
              <strong>{formatCount(summary.recentSyncRuns.length)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-bottom-grid">
        <article className="section-card analytics-mini-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operator layer</p>
              <h3>Chatter</h3>
            </div>
          </div>

          <p className="analytics-mini-copy">
            {pendingReviewsTotal > 0
              ? `${formatCount(pendingReviewsTotal)} open operator actions across pricing and catalog.`
              : "No open operator backlog right now."}
          </p>

          <div className="analytics-avatar-row">
            {pulsePeople.map((item) => (
              <div key={item.id} className="analytics-avatar-chip" title={item.caption}>
                {getInitials(item.label)}
              </div>
            ))}
          </div>
        </article>

        <article className="section-card analytics-mini-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Weighted focus</p>
              <h3>Top States</h3>
            </div>
          </div>

          <div className="analytics-state-list">
            {topStates.map((item) => (
              <div key={item.label} className="analytics-state-row">
                <div className="analytics-state-tag">{item.label}</div>
                <div className="analytics-state-track">
                  <div className="analytics-state-fill" style={{ width: `${Math.min(item.value, 100)}%` }} />
                </div>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card analytics-mini-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Routes</p>
              <h3>New Deals</h3>
            </div>
          </div>

          <div className="analytics-pill-grid">
            {analyticsRoutes.map((item) => (
              <Link key={item.label} href={item.href} className="analytics-route-pill">
                <span>+</span>
                <strong>{item.label}</strong>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
