import Link from "next/link";

import { getDashboardSummary } from "@/lib/api";
import { moduleContent } from "@/lib/module-content";
import { pipelineStages } from "@/lib/navigation";

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

function getModeLabel(mode: "live" | "preview" | "degraded") {
  if (mode === "live") {
    return "Warehouse live";
  }

  if (mode === "degraded") {
    return "Partial data";
  }

  return "Preview mode";
}

export async function DashboardHome() {
  const modules = Object.entries(moduleContent);
  const summary = await getDashboardSummary();
  const dashboardMetrics = [
    {
      label: "Tracked products",
      value: formatCount(summary.metrics.trackedProducts),
      detail: "Shopify products normalized into the operating store"
    },
    {
      label: "Tracked variants",
      value: formatCount(summary.metrics.trackedVariants),
      detail: "SKU candidates available for pricing and inventory decisions"
    },
    {
      label: "Orders synced",
      value: formatCount(summary.metrics.totalOrders),
      detail: "Order history currently stored in PostgreSQL"
    },
    {
      label: "Pending actions",
      value: formatCount(
        summary.metrics.pendingPricingRecommendations + summary.metrics.pendingCatalogEnrichmentRuns
      ),
      detail: "Open pricing plus catalog tasks waiting for review or provider setup"
    },
    {
      label: "Open alerts",
      value: formatCount(summary.metrics.openAlerts),
      detail: "Operational exceptions still waiting for triage"
    },
    {
      label: "Sync success 24h",
      value: formatPercent(summary.syncHealth.successRateLast24h),
      detail:
        summary.syncHealth.totalRunsLast24h > 0
          ? `${summary.syncHealth.successfulRunsLast24h}/${summary.syncHealth.totalRunsLast24h} successful runs in the last 24 hours`
          : "No sync runs have landed in the last 24 hours yet"
    }
  ];

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Mission control</p>
            <h3>Build the operating system behind pricing, inventory, and catalog growth.</h3>
            <p className="hero-copy">
              This starter shell is now backed by live read models from the API. As ingestion and
              worker jobs grow, this becomes the one place to watch SKU health, approvals, sync
              reliability, and connector readiness.
            </p>
          </div>
          <div className={`status-indicator is-${summary.mode}`}>
            <span>{getModeLabel(summary.mode)}</span>
            <strong>Last sync: {formatDate(summary.syncHealth.lastSyncAt)}</strong>
          </div>
        </div>

        {summary.reason ? (
          <div className="banner-card">
            <strong>Dashboard note</strong>
            <p>{summary.reason}</p>
          </div>
        ) : null}

        <div className="metrics-grid">
          {dashboardMetrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card split-grid">
        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Queues</p>
              <h3>Pricing recommendations</h3>
            </div>
            <Link href="/modules/pricing-engine" className="text-link">
              Open module
            </Link>
          </div>

          <div className="list-stack">
            {summary.recentPricingRecommendations.length > 0 ? (
              summary.recentPricingRecommendations.map((item) => (
                <div key={item.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{item.sku ?? item.externalVariantId}</strong>
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  </div>
                  <p>
                    {formatCurrency(item.currentPrice)} to {formatCurrency(item.recommendedPrice)}
                  </p>
                  <small className="list-meta">
                    Change {formatPercent(item.changePercent)} · Confidence{" "}
                    {formatPercent(item.confidenceScore)}
                  </small>
                </div>
              ))
            ) : (
              <div className="list-card">
                No pricing recommendations yet. Run the worker again after more Shopify variants
                land in PostgreSQL.
              </div>
            )}
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Queues</p>
              <h3>Catalog enrichment runs</h3>
            </div>
            <Link href="/modules/catalog-ai" className="text-link">
              Open module
            </Link>
          </div>

          <div className="list-stack">
            {summary.recentCatalogEnrichmentRuns.length > 0 ? (
              summary.recentCatalogEnrichmentRuns.map((item) => (
                <div key={item.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{item.externalProductId}</strong>
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  </div>
                  <p>
                    Provider {item.provider ?? "not configured"} · Prompt{" "}
                    {item.promptVersion ?? "pending"}
                  </p>
                  <small className="list-meta">
                    Created {formatDate(item.createdAt)}
                    {item.completedAt ? ` · Completed ${formatDate(item.completedAt)}` : ""}
                  </small>
                </div>
              ))
            ) : (
              <div className="list-card">
                No enrichment runs yet. The catalog queue will appear here after worker planning
                persists its first batch.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="section-card split-grid">
        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operations</p>
              <h3>Recent sync activity</h3>
            </div>
            <Link href="/modules/integrations" className="text-link">
              Open module
            </Link>
          </div>

          <div className="list-stack">
            {summary.recentSyncRuns.length > 0 ? (
              summary.recentSyncRuns.map((item) => (
                <div key={item.id} className="list-card">
                  <div className="list-card-header">
                    <strong>
                      {item.connector} · {item.resourceType}
                    </strong>
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  </div>
                  <p>
                    {item.triggerType} trigger
                    {item.externalReference ? ` · Ref ${item.externalReference}` : ""}
                  </p>
                  <small className="list-meta">Started {formatDate(item.startedAt)}</small>
                </div>
              ))
            ) : (
              <div className="list-card">
                No sync history yet. Shopify webhooks will start populating this timeline as soon as
                live traffic or test payloads hit the API.
              </div>
            )}
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Readiness</p>
              <h3>Integration setup status</h3>
            </div>
            <Link href="/modules/settings" className="text-link">
              Open module
            </Link>
          </div>

          <div className="metrics-grid compact-grid">
            <article className="metric-card">
              <span>Configured</span>
              <strong>{formatCount(summary.integrationSummary.configured)}</strong>
              <p>Integrations already wired with usable credentials.</p>
            </article>
            <article className="metric-card">
              <span>Manual setup</span>
              <strong>{formatCount(summary.integrationSummary.needsManualSetup)}</strong>
              <p>Connectors still waiting on signup or API credentials.</p>
            </article>
            <article className="metric-card">
              <span>Code ready</span>
              <strong>{formatCount(summary.integrationSummary.codeReady)}</strong>
              <p>Areas where scaffolding is ready before live provider wiring.</p>
            </article>
          </div>
        </article>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Alerts</p>
            <h3>Operational queue</h3>
          </div>
          <Link href="/modules/alerts" className="text-link">
            Open module
          </Link>
        </div>

        <div className="list-stack">
          {summary.recentAlerts.length > 0 ? (
            summary.recentAlerts.map((item) => (
              <div key={item.id} className="list-card">
                <div className="list-card-header">
                  <strong>{item.title}</strong>
                  <span className={`status-pill status-${item.severity}`}>{item.severity}</span>
                </div>
                <p>
                  {item.source} · {item.type} · {item.status}
                </p>
                <small className="list-meta">Created {formatDate(item.createdAt)}</small>
              </div>
            ))
          ) : (
            <div className="list-card">
              No alerts are open yet. When sync failures or pricing anomalies happen, they will show
              up here for triage.
            </div>
          )}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h3>Core operating loop</h3>
          </div>
        </div>

        <div className="pipeline-grid">
          {pipelineStages.map((stage) => (
            <article key={stage.name} className="pipeline-card">
              <strong>{stage.name}</strong>
              <p>{stage.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Modules</p>
            <h3>Planned surfaces</h3>
          </div>
        </div>

        <div className="module-grid">
          {modules.map(([slug, module]) => (
            <article key={slug} className="module-card">
              <div className="module-card-header">
                <div>
                  <h4>{module.title}</h4>
                  <span>{module.maturity}</span>
                </div>
                <Link href={`/modules/${slug}`} className="text-link">
                  Open
                </Link>
              </div>

              <p>{module.summary}</p>

              <div className="chip-row">
                {module.outputs.slice(0, 3).map((output) => (
                  <span key={output} className="chip">
                    {output}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
