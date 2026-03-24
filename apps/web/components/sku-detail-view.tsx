import { ActionFeedbackBanner } from "@/components/action-feedback-banner";
import { CatalogRunActions } from "@/components/catalog-run-actions";
import { PricingReviewWorkbench } from "@/components/pricing-review-workbench";
import Link from "next/link";

import { PricingReviewActions } from "@/components/pricing-review-actions";
import type { ActionFeedback } from "@/lib/action-feedback";
import type { ItemResponse, SkuDetail } from "@/lib/api";

type SkuDetailViewProps = {
  externalVariantId: string;
  feedback?: ActionFeedback | null;
  response: ItemResponse<SkuDetail>;
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

function humanizeStatus(value: string | null | undefined) {
  if (!value) {
    return "not started";
  }

  return value.replaceAll("_", " ");
}

function humanizeSource(value: string | null | undefined) {
  if (!value) {
    return "unknown channel";
  }

  return value.replaceAll("-", " ");
}

function toneForStatus(value: string | null | undefined) {
  if (!value) {
    return "status-medium";
  }

  if (value === "success" || value === "completed" || value === "configured" || value === "approved") {
    return "status-success";
  }

  if (value === "failed" || value === "critical" || value === "rejected" || value === "cancelled") {
    return "status-critical";
  }

  if (value === "processing" || value === "medium" || value === "queued") {
    return "status-medium";
  }

  return "status-pending";
}

function getModeLabel(mode: ItemResponse<SkuDetail>["mode"]) {
  if (mode === "live") {
    return "Live SKU state";
  }

  if (mode === "degraded") {
    return "Partial SKU state";
  }

  return "Preview SKU state";
}

export function SkuDetailView({
  externalVariantId,
  feedback = null,
  response
}: SkuDetailViewProps) {
  if (!response.item) {
    return (
      <div className="page-grid detail-page">
        <section className="hero-card executive-hero">
          <div className="hero-header">
            <div>
              <p className="eyebrow">SKU Detail</p>
              <h3>{externalVariantId}</h3>
              <p className="hero-copy">
                The detail view is not available yet for this SKU in the current environment.
              </p>
            </div>
            <div className={`status-indicator is-${response.mode}`}>
              <span>{getModeLabel(response.mode)}</span>
              <strong>{response.reason ?? "No detail payload available."}</strong>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { summary, orderHistory, inventoryHistory, pricingHistory, catalogHistory } = response.item;
  const returnPath = `/sku/${encodeURIComponent(summary.externalVariantId)}`;

  const executiveStats = [
    {
      tone: "navy",
      label: "Current Price",
      value: formatCurrency(summary.currentPrice),
      detail: "Latest synced Shopify price for this variant."
    },
    {
      tone: summary.availableInventory <= 2 ? "amber" : "green",
      label: "Available Inventory",
      value: formatCount(summary.availableInventory),
      detail: "Most recent stock position captured for this SKU."
    },
    {
      tone: "blue",
      label: "Units Sold 30D",
      value: formatCount(summary.unitsSold30d),
      detail: "Rolling demand signal from normalized order history."
    },
    {
      tone: "amber",
      label: "Recommended Price",
      value: formatCurrency(summary.recommendedPrice),
      detail: "Latest pricing recommendation currently on record."
    }
  ];

  return (
    <div className="page-grid detail-page">
      <section className="hero-card executive-hero detail-hero">
        <div className="hero-header">
          <div>
            <p className="eyebrow">System Operational Live</p>
            <h3 className="executive-title">
              SKU <span className="executive-title-accent">{summary.sku ?? summary.externalVariantId}</span>
            </h3>
            <p className="executive-welcome">LIVE COMMAND VIEW</p>
            <p className="hero-copy">
              {summary.productTitle} · {summary.variantTitle}
            </p>
            <div className="chip-row">
              <span className="chip">{summary.vendor ?? "Unknown vendor"}</span>
              <span className="chip">{summary.productType ?? "Unknown type"}</span>
              <span className={`status-pill ${toneForStatus(summary.pricingStatus)}`}>
                Pricing {humanizeStatus(summary.pricingStatus)}
              </span>
              <span className={`status-pill ${toneForStatus(summary.catalogStatus)}`}>
                Catalog {humanizeStatus(summary.catalogStatus)}
              </span>
            </div>
          </div>

          <div className={`status-indicator is-${response.mode}`}>
            <span>{getModeLabel(response.mode)}</span>
            <strong>Last order: {formatDate(summary.lastOrderedAt)}</strong>
          </div>
        </div>

        {feedback ? <ActionFeedbackBanner feedback={feedback} /> : null}

        {response.reason ? (
          <div className="banner-card">
            <strong>Detail note</strong>
            <p>{response.reason}</p>
          </div>
        ) : null}
      </section>

      <section className="executive-stat-grid detail-stat-grid">
        {executiveStats.map((item) => (
          <article key={item.label} className={`executive-stat-card stat-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Snapshot</p>
              <h3>Live SKU profile</h3>
            </div>
          </div>

          <div className="snapshot-stack">
            <div className="snapshot-row">
              <span>External variant ID</span>
              <strong>{summary.externalVariantId}</strong>
            </div>
            <div className="snapshot-row">
              <span>External product ID</span>
              <strong>{summary.externalProductId}</strong>
            </div>
            <div className="snapshot-row">
              <span>Product status</span>
              <strong>{summary.productStatus}</strong>
            </div>
            <div className="snapshot-row">
              <span>Inventory policy</span>
              <strong>{summary.inventoryPolicy ?? "n/a"}</strong>
            </div>
            <div className="snapshot-row">
              <span>Tracking</span>
              <strong>{summary.tracked === null ? "unknown" : summary.tracked ? "tracked" : "not tracked"}</strong>
            </div>
            <div className="snapshot-row">
              <span>Compare-at price</span>
              <strong>{formatCurrency(summary.compareAtPrice)}</strong>
            </div>
            <div className="snapshot-row">
              <span>Barcode</span>
              <strong>{summary.barcode ?? "n/a"}</strong>
            </div>
          </div>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick links</p>
              <h3>Jump into related views</h3>
            </div>
          </div>

          <div className="quick-link-stack">
            <Link href="/modules/sku-intelligence" className="quick-link-button quick-link-navy">
              <strong>Open SKU Intelligence</strong>
              <span>→</span>
            </Link>
            <Link href="/modules/pricing-engine" className="quick-link-button quick-link-blue">
              <strong>Open Pricing Engine</strong>
              <span>→</span>
            </Link>
            <Link href="/modules/inventory-control" className="quick-link-button quick-link-green">
              <strong>Open Inventory Control</strong>
              <span>→</span>
            </Link>
            <Link href="/modules/catalog-ai" className="quick-link-button quick-link-amber">
              <strong>Open Catalog AI</strong>
              <span>→</span>
            </Link>
          </div>

          <div className="detail-chip-block">
            <p className="eyebrow">Tags</p>
            <div className="chip-row no-top-gap">
              {summary.tags.length > 0 ? (
                summary.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="chip">No tags yet</span>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Orders</p>
              <h3>Recent order history</h3>
            </div>
            <span className="chip">{orderHistory.length} order events</span>
          </div>

          <div className="list-stack">
            {orderHistory.length > 0 ? (
              orderHistory.map((item) => (
                <div key={item.externalOrderId} className="list-card list-card-soft">
                  <div className="list-card-header">
                    <strong>{item.orderNumber ?? item.externalOrderId}</strong>
                    <span className={`status-pill ${toneForStatus(item.fulfillmentStatus)}`}>
                      {humanizeStatus(item.fulfillmentStatus)}
                    </span>
                  </div>
                  <p>
                    Qty {formatCount(item.quantity)} · Unit {formatCurrency(item.unitPrice)} · Line{" "}
                    {formatCurrency(item.lineTotal)}
                  </p>
                  <small className="list-meta">
                    Ordered {formatDate(item.orderedAt)} · Financial {humanizeStatus(item.financialStatus)}
                  </small>
                </div>
              ))
            ) : (
              <div className="empty-state-card empty-state-card-light">
                <strong>No order history yet</strong>
                <p>No order history has been synced for this SKU yet.</p>
              </div>
            )}
          </div>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Recent inventory snapshots</h3>
            </div>
            <span className="chip">{inventoryHistory.length} snapshots</span>
          </div>

          <div className="list-stack">
            {inventoryHistory.length > 0 ? (
              inventoryHistory.map((item) => (
                <div key={item.id} className="list-card list-card-soft">
                  <div className="list-card-header">
                    <strong>{formatCount(item.available)} available</strong>
                    <span className={`status-pill ${toneForStatus(item.available <= 2 ? "critical" : "success")}`}>
                      {item.available <= 2 ? "low stock" : "healthy"}
                    </span>
                  </div>
                  <p>
                    Committed {item.committed ?? 0} · Incoming {item.incoming ?? 0} · On hand{" "}
                    {item.onHand ?? item.available}
                  </p>
                  <small className="list-meta">Captured {formatDate(item.capturedAt)}</small>
                </div>
              ))
            ) : (
              <div className="empty-state-card empty-state-card-light">
                <strong>No inventory snapshots yet</strong>
                <p>No inventory snapshots are available for this SKU yet.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pricing</p>
              <h3>Recommendation history</h3>
            </div>
            <span className="chip">{pricingHistory.length} pricing decisions</span>
          </div>

          <div className="list-stack">
            {pricingHistory.length > 0 ? (
              pricingHistory.map((item) => (
                <div key={item.id} className="list-card list-card-soft">
                  <div className="list-card-header">
                    <strong>
                      {formatCurrency(item.currentPrice)} to {formatCurrency(item.recommendedPrice)}
                    </strong>
                    <span className={`status-pill ${toneForStatus(item.status)}`}>
                      {humanizeStatus(item.status)}
                    </span>
                  </div>
                  <p>
                    Confidence {item.confidenceScore?.toFixed(1) ?? "n/a"}% · Reviewed{" "}
                    {formatDate(item.reviewedAt)}
                  </p>
                  {item.reviewedAt ? (
                    <small className="list-meta">
                      Reviewed by {item.reviewOperatorLabel ?? "Local operator"} via{" "}
                      {humanizeSource(item.reviewSource)}.
                    </small>
                  ) : null}
                  <small className="list-meta">
                    {item.reasons.length > 0 ? item.reasons.join(" ") : "No pricing rationale saved yet."}
                  </small>

                  {item.status === "pending" || item.reviewState.updatedAt || item.reviewState.notes ? (
                    <PricingReviewWorkbench
                      recommendationId={item.id}
                      returnPath={returnPath}
                      reviewState={item.reviewState}
                      skuLabel={summary.sku ?? summary.externalVariantId}
                      changeLabel={`${formatCurrency(item.currentPrice)} to ${formatCurrency(item.recommendedPrice)}`}
                      confidenceLabel={`Confidence ${item.confidenceScore?.toFixed(1) ?? "n/a"}%`}
                    />
                  ) : null}

                  {item.reviewEvents.length > 0 ? (
                    <div className="event-stack">
                      <div className="section-heading section-heading-compact">
                        <div>
                          <p className="eyebrow">Pricing activity</p>
                          <h3>Decision trail</h3>
                        </div>
                      </div>
                      {item.reviewEvents.map((event) => (
                        <div key={event.id} className="event-card">
                          <div className="list-card-header">
                            <strong>{event.summary}</strong>
                            <span className={`status-pill ${toneForStatus(event.eventType)}`}>
                              {humanizeStatus(event.eventType)}
                            </span>
                          </div>
                          <small className="list-meta">Logged {formatDate(event.createdAt)}</small>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {item.status === "pending" ? (
                    <PricingReviewActions recommendationId={item.id} returnPath={returnPath} />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state-card empty-state-card-light">
                <strong>No pricing recommendations yet</strong>
                <p>No pricing recommendations have been saved for this SKU yet.</p>
              </div>
            )}
          </div>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog</p>
              <h3>Enrichment run history</h3>
            </div>
            <span className="chip">{catalogHistory.length} catalog runs</span>
          </div>

          <div className="list-stack">
            {catalogHistory.length > 0 ? (
              catalogHistory.map((item) => (
                <div key={item.id} className="list-card list-card-soft">
                  <div className="list-card-header">
                    <Link href={`/catalog/runs/${encodeURIComponent(item.id)}`} className="text-link text-link-strong">
                      <strong>{item.promptVersion ?? "Prompt pending"}</strong>
                    </Link>
                    <span className={`status-pill ${toneForStatus(item.status)}`}>
                      {humanizeStatus(item.status)}
                    </span>
                  </div>
                  <p>
                    Provider {item.provider ?? "not configured"} · Created {formatDate(item.createdAt)}
                  </p>
                  <small className="list-meta">
                    {item.errorMessage ?? `Completed ${formatDate(item.completedAt)}`}
                  </small>
                  {item.status !== "completed" && item.status !== "cancelled" ? (
                    <CatalogRunActions runId={item.id} returnPath={returnPath} />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state-card empty-state-card-light">
                <strong>No catalog runs yet</strong>
                <p>No catalog enrichment runs are tied to this SKU yet.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
