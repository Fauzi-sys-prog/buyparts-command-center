import { CatalogRunActions } from "@/components/catalog-run-actions";
import Link from "next/link";

import { PricingReviewActions } from "@/components/pricing-review-actions";
import type { ItemResponse, SkuDetail } from "@/lib/api";

type SkuDetailViewProps = {
  externalVariantId: string;
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

function toneForStatus(value: string | null | undefined) {
  if (!value) {
    return "status-medium";
  }

  if (value === "success" || value === "completed" || value === "configured") {
    return "status-success";
  }

  if (value === "failed" || value === "critical") {
    return "status-critical";
  }

  if (value === "processing" || value === "medium") {
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

export function SkuDetailView({ externalVariantId, response }: SkuDetailViewProps) {
  if (!response.item) {
    return (
      <div className="page-grid">
        <section className="hero-card">
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

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">SKU Detail</p>
            <h3>{summary.sku ?? summary.externalVariantId}</h3>
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

        {response.reason ? (
          <div className="banner-card">
            <strong>Detail note</strong>
            <p>{response.reason}</p>
          </div>
        ) : null}

        <div className="metrics-grid">
          <article className="metric-card">
            <span>Current price</span>
            <strong>{formatCurrency(summary.currentPrice)}</strong>
            <p>Current synced Shopify price for this variant.</p>
          </article>
          <article className="metric-card">
            <span>Available inventory</span>
            <strong>{formatCount(summary.availableInventory)}</strong>
            <p>Latest inventory snapshot captured for this SKU.</p>
          </article>
          <article className="metric-card">
            <span>Units sold 30d</span>
            <strong>{formatCount(summary.unitsSold30d)}</strong>
            <p>Rolling 30-day quantity sold from synced orders.</p>
          </article>
          <article className="metric-card">
            <span>Total orders</span>
            <strong>{formatCount(summary.ordersCount)}</strong>
            <p>Total orders recorded for this variant so far.</p>
          </article>
          <article className="metric-card">
            <span>Recommended price</span>
            <strong>{formatCurrency(summary.recommendedPrice)}</strong>
            <p>Latest price recommendation currently on record.</p>
          </article>
          <article className="metric-card">
            <span>Barcode</span>
            <strong>{summary.barcode ?? "n/a"}</strong>
            <p>Variant barcode or external identifier when available.</p>
          </article>
        </div>
      </section>

      <section className="section-card split-grid">
        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Snapshot</p>
              <h3>Current SKU profile</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card">
              External variant ID: {summary.externalVariantId}
            </div>
            <div className="list-card">
              External product ID: {summary.externalProductId}
            </div>
            <div className="list-card">
              Product status: {summary.productStatus}
            </div>
            <div className="list-card">
              Inventory policy: {summary.inventoryPolicy ?? "n/a"}
            </div>
            <div className="list-card">
              Tracking: {summary.tracked === null ? "unknown" : summary.tracked ? "tracked" : "not tracked"}
            </div>
            <div className="list-card">
              Compare-at price: {formatCurrency(summary.compareAtPrice)}
            </div>
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick links</p>
              <h3>Jump back into modules</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card">
              <Link href="/modules/sku-intelligence" className="text-link">
                Open SKU Intelligence
              </Link>
            </div>
            <div className="list-card">
              <Link href="/modules/pricing-engine" className="text-link">
                Open Pricing Engine
              </Link>
            </div>
            <div className="list-card">
              <Link href="/modules/inventory-control" className="text-link">
                Open Inventory Control
              </Link>
            </div>
            <div className="list-card">
              <Link href="/modules/catalog-ai" className="text-link">
                Open Catalog AI
              </Link>
            </div>
            <div className="list-card">
              Tags:
              <div className="chip-row">
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
          </div>
        </article>
      </section>

      <section className="section-card split-grid">
        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Orders</p>
              <h3>Recent order history</h3>
            </div>
          </div>

          <div className="list-stack">
            {orderHistory.length > 0 ? (
              orderHistory.map((item) => (
                <div key={item.externalOrderId} className="list-card">
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
              <div className="list-card">No order history has been synced for this SKU yet.</div>
            )}
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Recent inventory snapshots</h3>
            </div>
          </div>

          <div className="list-stack">
            {inventoryHistory.length > 0 ? (
              inventoryHistory.map((item) => (
                <div key={item.id} className="list-card">
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
              <div className="list-card">No inventory snapshots are available for this SKU yet.</div>
            )}
          </div>
        </article>
      </section>

      <section className="section-card split-grid">
        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pricing</p>
              <h3>Recommendation history</h3>
            </div>
          </div>

          <div className="list-stack">
            {pricingHistory.length > 0 ? (
              pricingHistory.map((item) => (
                <div key={item.id} className="list-card">
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
                  <small className="list-meta">
                    {item.reasons.length > 0 ? item.reasons.join(" ") : "No pricing rationale saved yet."}
                  </small>
                  {item.status === "pending" ? (
                    <PricingReviewActions recommendationId={item.id} returnPath={returnPath} />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="list-card">No pricing recommendations have been saved for this SKU yet.</div>
            )}
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog</p>
              <h3>Enrichment run history</h3>
            </div>
          </div>

          <div className="list-stack">
            {catalogHistory.length > 0 ? (
              catalogHistory.map((item) => (
                <div key={item.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{item.promptVersion ?? "Prompt pending"}</strong>
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
              <div className="list-card">No catalog enrichment runs are tied to this SKU yet.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
