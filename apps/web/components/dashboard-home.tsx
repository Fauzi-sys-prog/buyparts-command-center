import { ActionFeedbackBanner } from "@/components/action-feedback-banner";
import { CatalogRunActions } from "@/components/catalog-run-actions";
import { PricingReviewActions } from "@/components/pricing-review-actions";
import Link from "next/link";

import type { ActionFeedback } from "@/lib/action-feedback";
import type { ActivityFeedItem } from "@/lib/api";
import { getCatalogEnrichmentRuns, getDashboardSummary, getPricingRecommendations } from "@/lib/api";

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
  filters?: {
    pricingQ?: string;
    pricingStatus?: string;
    catalogQ?: string;
    catalogStatus?: string;
  };
};

export async function DashboardHome({ feedback = null }: DashboardHomeProps) {
  const [summary, pricing, catalog] = await Promise.all([
    getDashboardSummary(),
    getPricingRecommendations(8),
    getCatalogEnrichmentRuns(8)
  ]);

  const pendingPricing = pricing.items.filter((item) => item.status === "pending");
  const activeCatalog = catalog.items.filter((item) => item.status !== "completed" && item.status !== "cancelled");
  const featuredPricing = pendingPricing[0] ?? pricing.items[0] ?? null;
  const featuredCatalog = activeCatalog[0] ?? catalog.items[0] ?? null;
  const featuredActivity = summary.recentActivity[0] ?? null;

  const executiveStats = [
    {
      tone: "navy",
      label: "Tracked Variants",
      value: formatCount(summary.metrics.trackedVariants),
      detail: "SKU candidates available for pricing and operations."
    },
    {
      tone: "green",
      label: "Orders Synced",
      value: formatCount(summary.metrics.totalOrders),
      detail: "Order records already normalized into PostgreSQL."
    },
    {
      tone: "amber",
      label: "Pending Reviews",
      value: formatCount(
        summary.metrics.pendingPricingRecommendations + summary.metrics.pendingCatalogEnrichmentRuns
      ),
      detail: "Open pricing and catalog tasks waiting for operator attention."
    },
    {
      tone: "blue",
      label: "Sync Success",
      value: formatPercent(summary.syncHealth.successRateLast24h),
      detail:
        summary.syncHealth.totalRunsLast24h > 0
          ? `${summary.syncHealth.successfulRunsLast24h}/${summary.syncHealth.totalRunsLast24h} successful runs in the last 24 hours.`
          : "No sync runs have landed in the last 24 hours yet."
    }
  ];

  const quickLinks = [
    {
      label: "Open Dashboard Queue",
      href: "/modules/pricing-engine",
      tone: "navy"
    },
    {
      label: "Review Catalog Run",
      href: featuredCatalog ? `/catalog/runs/${encodeURIComponent(featuredCatalog.id)}` : "/modules/catalog-ai",
      tone: "blue"
    },
    {
      label: "Open Live SKU",
      href: featuredPricing ? `/sku/${encodeURIComponent(featuredPricing.externalVariantId)}` : "/modules/sku-intelligence",
      tone: "green"
    },
    {
      label: "Setup Readiness",
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

  return (
    <div className="page-grid executive-page">
      <section className="hero-card executive-hero">
        <div className="hero-header">
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

          <div className={`status-indicator is-${summary.mode}`}>
            <span>{getModeLabel(summary.mode)}</span>
            <strong>Last sync: {formatDate(summary.syncHealth.lastSyncAt)}</strong>
          </div>
        </div>

        {feedback ? <ActionFeedbackBanner feedback={feedback} /> : null}

        {summary.reason ? (
          <div className="banner-card">
            <strong>Dashboard note</strong>
            <p>{summary.reason}</p>
          </div>
        ) : null}
      </section>

      <section className="executive-stat-grid">
        {executiveStats.map((item) => (
          <article key={item.label} className={`executive-stat-card stat-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
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
                <strong>{item.label}</strong>
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
    </div>
  );
}
