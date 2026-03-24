import { ActionFeedbackBanner } from "@/components/action-feedback-banner";
import { CatalogRunActions } from "@/components/catalog-run-actions";
import { CatalogReviewWorkbench } from "@/components/catalog-review-workbench";
import Link from "next/link";

import type { ActionFeedback } from "@/lib/action-feedback";
import type { CatalogRunDetail, ItemResponse } from "@/lib/api";

type CatalogRunDetailViewProps = {
  feedback?: ActionFeedback | null;
  runId: string;
  response: ItemResponse<CatalogRunDetail>;
};

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

  if (value === "success" || value === "completed" || value === "configured" || value === "approved") {
    return "status-success";
  }

  if (value === "failed" || value === "critical" || value === "cancelled") {
    return "status-critical";
  }

  if (value === "queued" || value === "processing") {
    return "status-medium";
  }

  return "status-pending";
}

function getModeLabel(mode: ItemResponse<CatalogRunDetail>["mode"]) {
  if (mode === "live") {
    return "Live review state";
  }

  if (mode === "degraded") {
    return "Partial review state";
  }

  return "Preview review state";
}

function getPromptFamilies(inputPayload: Record<string, unknown>) {
  const value = inputPayload.prompt_families;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getReviewPriority(item: CatalogRunDetail) {
  if (!item.provider) {
    return "Provider access is still missing, so keep notes focused on data cleanup and queue readiness.";
  }

  if (item.reviewDraft.mode !== "payload") {
    return "This run is still based on a dry-run template, so review wording carefully before trusting it as production output.";
  }

  if (item.status === "queued") {
    return "This run is actively queued, so make sure the draft is clean enough before leaving it in the worker backlog.";
  }

  return "The provider payload is available, so focus on whether the content is ready for operational approval.";
}

export function CatalogRunDetailView({
  feedback = null,
  runId,
  response
}: CatalogRunDetailViewProps) {
  if (!response.item) {
    return (
      <div className="page-grid detail-page">
        <section className="hero-card executive-hero">
          <div className="hero-header">
            <div>
              <p className="eyebrow">Catalog Review</p>
              <h3>{runId}</h3>
              <p className="hero-copy">
                The review view is not available yet for this enrichment run in the current environment.
              </p>
            </div>
            <div className={`status-indicator is-${response.mode}`}>
              <span>{getModeLabel(response.mode)}</span>
              <strong>{response.reason ?? "No review payload available."}</strong>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const item = response.item;
  const promptFamilies = getPromptFamilies(item.inputPayload);
  const returnPath = `/catalog/runs/${encodeURIComponent(item.id)}`;

  const reviewStats = [
    {
      tone: "navy",
      label: "Provider",
      value: item.provider ?? "Not configured",
      detail: "Current provider state connected to this enrichment run."
    },
    {
      tone: "blue",
      label: "Prompt Version",
      value: item.promptVersion ?? "n/a",
      detail: "Prompt family snapshot captured for this review pass."
    },
    {
      tone: item.reviewDraft.mode === "payload" ? "green" : "amber",
      label: "Draft Mode",
      value: item.reviewDraft.mode === "payload" ? "Stored payload" : "Dry-run template",
      detail: "How the right-hand review draft was generated for this page."
    },
    {
      tone: item.completedAt ? "green" : "amber",
      label: "Completed At",
      value: formatDate(item.completedAt),
      detail: "Will remain empty while the run is still pending review or provider setup."
    }
  ];

  return (
    <div className="page-grid detail-page">
      <section className="hero-card executive-hero detail-hero">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Catalog Review Workspace</p>
            <h3 className="executive-title">
              Review <span className="executive-title-accent">{item.product.title}</span>
            </h3>
            <p className="executive-welcome">ENRICHMENT RUN {item.externalProductId}</p>
            <p className="hero-copy">
              Run {item.id} for product {item.externalProductId}
            </p>
            <div className="chip-row">
              <span className="chip">{item.product.vendor ?? "Unknown vendor"}</span>
              <span className="chip">{item.product.productType ?? "Unknown type"}</span>
              <span className={`status-pill ${toneForStatus(item.status)}`}>{humanizeStatus(item.status)}</span>
              <span className="chip">{item.promptVersion ?? "Prompt pending"}</span>
            </div>
          </div>

          <div className={`status-indicator is-${response.mode}`}>
            <span>{getModeLabel(response.mode)}</span>
            <strong>Created {formatDate(item.createdAt)}</strong>
          </div>
        </div>

        {feedback ? <ActionFeedbackBanner feedback={feedback} /> : null}

        {response.reason ? (
          <div className="banner-card">
            <strong>Review note</strong>
            <p>{response.reason}</p>
          </div>
        ) : null}

        {item.errorMessage ? (
          <div className="banner-card banner-warning">
            <strong>Run message</strong>
            <p>{item.errorMessage}</p>
          </div>
        ) : null}
      </section>

      <section className="executive-stat-grid detail-stat-grid">
        {reviewStats.map((itemStat) => (
          <article key={itemStat.label} className={`executive-stat-card stat-${itemStat.tone}`}>
            <span>{itemStat.label}</span>
            <strong>{itemStat.value}</strong>
            <p>{itemStat.detail}</p>
          </article>
        ))}
      </section>

      <section className="comparison-grid">
        <article className="section-card comparison-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Before</p>
              <h3>Current catalog snapshot</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card list-card-soft">
              <strong>{item.product.title}</strong>
              <p>Current synced product title.</p>
            </div>
            <div className="list-card list-card-soft">
              <strong>Handle</strong>
              <p>{item.product.handle ?? "n/a"}</p>
            </div>
            <div className="list-card list-card-soft">
              <strong>Status</strong>
              <p>{item.product.productStatus}</p>
            </div>
            <div className="list-card list-card-soft">
              <strong>Tags</strong>
              <div className="chip-row">
                {item.product.tags.length > 0 ? (
                  item.product.tags.map((tag) => (
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

        <article className="section-card comparison-card comparison-card-after">
          <div className="section-heading">
            <div>
              <p className="eyebrow">After</p>
              <h3>Review draft</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card list-card-soft">
              <strong>{item.reviewDraft.proposedTitle}</strong>
              <p>Proposed product title for review.</p>
            </div>

            <div className="list-card list-card-soft">
              <strong>Highlights</strong>
              <div className="list-stack compact-stack">
                {item.reviewDraft.proposedHighlights.length > 0 ? (
                  item.reviewDraft.proposedHighlights.map((highlight) => (
                    <div key={highlight} className="inline-note">
                      {highlight}
                    </div>
                  ))
                ) : (
                  <div className="inline-note">No draft highlights are available yet.</div>
                )}
              </div>
            </div>

            <div className="list-card list-card-soft">
              <strong>Fitment and tag signals</strong>
              <div className="list-stack compact-stack">
                {item.reviewDraft.fitmentSignals.length > 0 ? (
                  item.reviewDraft.fitmentSignals.map((signal) => (
                    <div key={signal} className="inline-note">
                      {signal}
                    </div>
                  ))
                ) : (
                  <div className="inline-note">No fitment signals have been derived yet.</div>
                )}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workbench</p>
              <h3>Operator checklist and notes</h3>
            </div>
          </div>

          <CatalogReviewWorkbench
            runId={item.id}
            returnPath={returnPath}
            initialReviewState={item.reviewState}
            productTitle={item.product.title}
            providerLabel={item.provider ?? "Not configured"}
            promptVersionLabel={item.promptVersion ?? "n/a"}
            draftModeLabel={item.reviewDraft.mode === "payload" ? "Stored payload" : "Dry-run template"}
            highlightCount={item.reviewDraft.proposedHighlights.length}
            attributeCount={item.reviewDraft.normalizedAttributes.length}
            fitmentCount={item.reviewDraft.fitmentSignals.length}
          />
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Guidance</p>
              <h3>How to review this run</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card list-card-soft">
              <strong>Current priority</strong>
              <p>{getReviewPriority(item)}</p>
            </div>

            <div className="list-card list-card-soft">
              <strong>What to verify first</strong>
              <div className="list-stack compact-stack">
                <div className="inline-note">Check whether the proposed title keeps the part intent clear and searchable.</div>
                <div className="inline-note">Look for missing attributes that would weaken filters, feed quality, or SKU matching.</div>
                <div className="inline-note">Review fitment and tags with extra care if supplier source data still looks sparse.</div>
              </div>
            </div>

            <div className="list-card list-card-soft">
              <strong>Prompt families in scope</strong>
              <div className="chip-row">
                {promptFamilies.length > 0 ? (
                  promptFamilies.map((prompt) => (
                    <span key={prompt} className="chip">
                      {prompt}
                    </span>
                  ))
                ) : (
                  <span className="chip">No prompt families saved</span>
                )}
              </div>
            </div>

            <div className="list-card list-card-soft">
              <strong>Review activity</strong>
              <div className="list-stack compact-stack">
                {item.reviewEvents.length > 0 ? (
                  item.reviewEvents.map((event) => (
                    <div key={event.id} className="event-card">
                      <strong>{event.summary}</strong>
                      <div className="list-meta">Logged {formatDate(event.createdAt)}</div>
                    </div>
                  ))
                ) : (
                  <div className="inline-note">
                    No review activity has been saved yet. The timeline will populate after you save a draft or update the run state.
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Context</p>
              <h3>Prompt and attribute inputs</h3>
            </div>
          </div>

          <div className="list-stack">
            <div className="list-card list-card-soft">
              <strong>Prompt families</strong>
              <div className="chip-row">
                {promptFamilies.length > 0 ? (
                  promptFamilies.map((prompt) => (
                    <span key={prompt} className="chip">
                      {prompt}
                    </span>
                  ))
                ) : (
                  <span className="chip">No prompt families saved</span>
                )}
              </div>
            </div>

            <div className="list-card list-card-soft">
              <strong>Normalized attributes</strong>
              <div className="definition-list">
                {item.reviewDraft.normalizedAttributes.length > 0 ? (
                  item.reviewDraft.normalizedAttributes.map((attribute) => (
                    <div key={attribute.label} className="definition-row">
                      <span>{attribute.label}</span>
                      <strong>{attribute.value}</strong>
                    </div>
                  ))
                ) : (
                  <div className="definition-row">
                    <span>Attributes</span>
                    <strong>No normalized attributes yet.</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="list-card list-card-soft">
              <strong>Draft rationale</strong>
              <p>{item.reviewDraft.rationale}</p>
            </div>
          </div>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Actions</p>
              <h3>Run controls and navigation</h3>
            </div>
          </div>

          <div className="quick-link-stack">
            {item.status !== "completed" && item.status !== "cancelled" ? (
              <div className="list-card list-card-soft">
                <strong>Operator controls</strong>
                <CatalogRunActions runId={item.id} returnPath={returnPath} />
              </div>
            ) : null}

            <Link href="/modules/catalog-ai" className="quick-link-button quick-link-blue">
              <strong>Back to Catalog AI Queue</strong>
              <span>→</span>
            </Link>

            <Link href="/modules/sku-intelligence" className="quick-link-button quick-link-navy">
              <strong>Open SKU Intelligence</strong>
              <span>→</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Payload</p>
              <h3>Input payload</h3>
            </div>
          </div>
          <pre className="payload-block payload-block-light">{JSON.stringify(item.inputPayload, null, 2)}</pre>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Payload</p>
              <h3>Output payload</h3>
            </div>
          </div>
          <pre className="payload-block payload-block-light">
            {JSON.stringify(item.outputPayload ?? { status: "not_generated_yet" }, null, 2)}
          </pre>
        </article>
      </section>
    </div>
  );
}
