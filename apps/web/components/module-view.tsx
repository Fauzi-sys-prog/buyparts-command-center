import { ActionFeedbackBanner } from "@/components/action-feedback-banner";
import { BulkSelectionToggle } from "@/components/bulk-selection-toggle";
import { CatalogRunActions } from "@/components/catalog-run-actions";
import { OperatorProfileHiddenInput } from "@/components/operator-profile-hidden-input";
import Link from "next/link";

import { PricingReviewActions } from "@/components/pricing-review-actions";
import type { ActionFeedback } from "@/lib/action-feedback";
import {
  cancelSelectedCatalogRunsAction,
  queueSelectedCatalogRunsAction
} from "@/lib/catalog-run-actions";
import type { ModuleContent } from "@/lib/module-content";
import type { ModuleRuntime, ModuleRuntimeFilters } from "@/lib/module-runtime";
import {
  approveSelectedPricingRecommendationsAction,
  rejectSelectedPricingRecommendationsAction
} from "@/lib/pricing-review-actions";

type ModuleViewProps = {
  feedback?: ActionFeedback | null;
  module: ModuleContent;
  slug: string;
  filters: ModuleRuntimeFilters;
  runtime: ModuleRuntime;
};

function getModeLabel(mode: ModuleRuntime["mode"]) {
  if (mode === "live") {
    return "Live module state";
  }

  if (mode === "degraded") {
    return "Partial module state";
  }

  return "Preview module state";
}

function getToneClass(tone: NonNullable<ModuleRuntime["sections"][number]["items"][number]["statusTone"]>) {
  return `status-${tone}`;
}

function getSectionCountLabel(slug: string, count: number) {
  if (slug === "pricing-engine") {
    return `${count} recommendation${count === 1 ? "" : "s"}`;
  }

  if (slug === "catalog-ai") {
    return `${count} run${count === 1 ? "" : "s"}`;
  }

  return `${count} live item${count === 1 ? "" : "s"}`;
}

export function ModuleView({ feedback = null, module, slug, filters, runtime }: ModuleViewProps) {
  const hasQueueFilterState = Boolean(filters.status || filters.q || (filters.sort && filters.sort !== "newest"));

  function getSortOptions() {
    if (slug === "pricing-engine") {
      return [
        { value: "newest", label: "Newest first" },
        { value: "largest-change", label: "Largest change" },
        { value: "highest-confidence", label: "Highest confidence" },
        { value: "status", label: "Status" }
      ];
    }

    if (slug === "catalog-ai") {
      return [
        { value: "newest", label: "Newest first" },
        { value: "oldest", label: "Oldest first" },
        { value: "status", label: "Status" },
        { value: "product", label: "Product ID" }
      ];
    }

    return [];
  }

  function getSortLabel() {
    const activeSort = filters.sort ?? "newest";
    return getSortOptions().find((option) => option.value === activeSort)?.label ?? "Newest first";
  }

  function renderActiveFilterSummary() {
    if (slug !== "pricing-engine" && slug !== "catalog-ai") {
      return null;
    }

    const activeChips = [
      filters.status ? `Status: ${filters.status.replaceAll("_", " ")}` : null,
      filters.q ? `Search: ${filters.q}` : null,
      `Sort: ${getSortLabel()}`
    ].filter(Boolean);

    const queueSection = runtime.sections.find((section) => section.layout === "table");
    const visibleCount = queueSection?.items.length ?? 0;

    return (
      <section className="section-card executive-panel">
        <div className="active-filter-bar active-filter-bar-elevated">
          <div>
            <p className="eyebrow">Queue state</p>
            <div className="chip-row no-top-gap">
              {activeChips.map((chip) => (
                <span key={chip} className="chip filter-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <span className="filter-result-count">
            {visibleCount} visible {slug === "pricing-engine" ? "recommendation" : "run"}
            {visibleCount === 1 ? "" : "s"}
          </span>
        </div>
      </section>
    );
  }

  function renderItemActions(item: ModuleRuntime["sections"][number]["items"][number]) {
    if (item.reviewableRecommendationId && item.reviewReturnPath) {
      return (
        <PricingReviewActions
          recommendationId={item.reviewableRecommendationId}
          returnPath={item.reviewReturnPath}
        />
      );
    }

    if (item.catalogRunId && item.catalogReturnPath) {
      return <CatalogRunActions runId={item.catalogRunId} returnPath={item.catalogReturnPath} />;
    }

    return null;
  }

  function getBulkSelectableId(item: ModuleRuntime["sections"][number]["items"][number]) {
    return item.reviewableRecommendationId ?? item.catalogRunId ?? undefined;
  }

  function getBulkFormId(section: ModuleRuntime["sections"][number]) {
    return `${slug}-${section.title.replace(/\s+/g, "-").toLowerCase()}-bulk-form`;
  }

  function getBulkSelectionGroup(section: ModuleRuntime["sections"][number]) {
    return `${getBulkFormId(section)}-selection`;
  }

  function getSectionReturnPath(section: ModuleRuntime["sections"][number]) {
    return (
      section.items.find((item) => item.reviewReturnPath)?.reviewReturnPath ??
      section.items.find((item) => item.catalogReturnPath)?.catalogReturnPath ??
      `/modules/${slug}`
    );
  }

  function renderBulkActions(section: ModuleRuntime["sections"][number]) {
    if (section.layout !== "table") {
      return null;
    }

    const selectableItems = section.items
      .map((item) => ({
        id: getBulkSelectableId(item),
        title: item.title
      }))
      .filter((item): item is { id: string; title: string } => Boolean(item.id));

    if (selectableItems.length === 0) {
      return null;
    }

    const formId = getBulkFormId(section);
    const selectionGroup = getBulkSelectionGroup(section);
    const returnPath = getSectionReturnPath(section);

    if (slug === "pricing-engine") {
      const approveSelectedAction = approveSelectedPricingRecommendationsAction.bind(null, returnPath);
      const rejectSelectedAction = rejectSelectedPricingRecommendationsAction.bind(null, returnPath);

      return (
        <div className="bulk-action-bar">
          <div className="bulk-action-copy">
            <BulkSelectionToggle group={selectionGroup} />
            <span>Select pending recommendations to approve or reject in one pass.</span>
          </div>

          <form id={formId} className="bulk-action-controls">
            <OperatorProfileHiddenInput />
            <button type="submit" formAction={approveSelectedAction} className="action-button action-approve">
              Approve selected
            </button>
            <button type="submit" formAction={rejectSelectedAction} className="action-button action-reject">
              Reject selected
            </button>
          </form>
        </div>
      );
    }

    if (slug === "catalog-ai") {
      const queueSelectedAction = queueSelectedCatalogRunsAction.bind(null, returnPath);
      const cancelSelectedAction = cancelSelectedCatalogRunsAction.bind(null, returnPath);

      return (
        <div className="bulk-action-bar">
          <div className="bulk-action-copy">
            <BulkSelectionToggle group={selectionGroup} />
            <span>Select active catalog runs to queue or cancel together.</span>
          </div>

          <form id={formId} className="bulk-action-controls">
            <OperatorProfileHiddenInput />
            <button type="submit" formAction={queueSelectedAction} className="action-button action-queue">
              Queue selected
            </button>
            <button type="submit" formAction={cancelSelectedAction} className="action-button action-reject">
              Cancel selected
            </button>
          </form>
        </div>
      );
    }

    return null;
  }

  function renderQueueFilters() {
    if (slug !== "pricing-engine" && slug !== "catalog-ai") {
      return null;
    }

    const statusOptions =
      slug === "pricing-engine"
        ? [
            { value: "", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]
        : [
            { value: "", label: "All statuses" },
            { value: "pending_provider_config", label: "Provider blocked" },
            { value: "queued", label: "Queued" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" }
          ];

    const queryPlaceholder =
      slug === "pricing-engine"
        ? "Search SKU, variant ID, or status"
        : "Search product ID, provider, prompt, or status";

    return (
      <section className="section-card executive-panel module-filter-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Control surface</p>
            <h3>Queue controls</h3>
          </div>
          <span className="chip">Operator view</span>
        </div>

        <form action={`/modules/${slug}`} method="get" className="filter-form">
          <div className="filter-grid">
            <label className="filter-field">
              <span>Status</span>
              <select name="status" defaultValue={filters.status ?? ""}>
                {statusOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Search</span>
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder={queryPlaceholder}
              />
            </label>

            <label className="filter-field">
              <span>Sort</span>
              <select name="sort" defaultValue={filters.sort ?? "newest"}>
                {getSortOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="filter-actions">
            <button type="submit" className="action-button action-queue">
              Apply filters
            </button>
            <Link href={`/modules/${slug}`} className="text-link">
              Clear
            </Link>
          </div>
        </form>
      </section>
    );
  }

  function renderSectionEmptyState(section: ModuleRuntime["sections"][number]) {
    const showQueueCtas = section.layout === "table" && (slug === "pricing-engine" || slug === "catalog-ai");

    return (
      <div className="empty-state-card empty-state-card-light">
        <strong>{section.emptyState}</strong>
        <p>
          {showQueueCtas && hasQueueFilterState
            ? "The current queue view is empty with the active filters. Clear the filters to widen the review queue, or jump back to the dashboard for the seeded walkthrough."
            : "This slice is ready for more live data. As the API and worker flows mature, new items will land here automatically."}
        </p>
        <div className="chip-row">
          {showQueueCtas ? (
            <Link href={`/modules/${slug}`} className="text-link">
              Clear filters
            </Link>
          ) : null}
          <Link href="/" className="text-link">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Owner lane",
      value: module.owners.join(" / "),
      detail: "Primary operators responsible for decisions in this module.",
      tone: "navy"
    },
    {
      label: "Data sources",
      value: String(module.dataSources.length),
      detail: "Upstream systems needed before the module is fully live.",
      tone: "green"
    },
    {
      label: "Expected outputs",
      value: String(module.outputs.length),
      detail: "Operational outcomes this surface is designed to produce.",
      tone: "amber"
    },
    ...runtime.metrics.slice(0, 2).map((metric, index) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.detail,
      tone: index % 2 === 0 ? "blue" : "navy"
    }))
  ];

  return (
    <div className="page-grid module-executive-page">
      <section className="hero-card executive-hero module-hero">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Operational Module</p>
            <h3 className="executive-title">
              {module.title.split(" ")[0]}{" "}
              <span className="executive-title-accent">{module.title.split(" ").slice(1).join(" ")}</span>
            </h3>
            <p className="executive-welcome">{module.maturity}</p>
            <p className="hero-copy">{module.summary}</p>
            <div className="chip-row">
              <span className="chip">Owners: {module.owners.join(" / ")}</span>
              <span className="chip">{module.dataSources.length} source nodes</span>
              <span className="chip">{module.outputs.length} outcome tracks</span>
            </div>
          </div>

          <div className={`status-indicator is-${runtime.mode}`}>
            <span>{getModeLabel(runtime.mode)}</span>
            <strong>{runtime.metrics.length} live metrics available</strong>
          </div>
        </div>

        {feedback ? <ActionFeedbackBanner feedback={feedback} /> : null}

        {runtime.reason ? (
          <div className="banner-card">
            <strong>Module note</strong>
            <p>{runtime.reason}</p>
          </div>
        ) : null}
      </section>

      <section className="module-summary-grid">
        {summaryCards.map((card) => (
          <article key={`${card.label}-${card.value}`} className={`executive-stat-card stat-${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>

      {renderQueueFilters()}

      {renderActiveFilterSummary()}

      <section className="section-card detail-surface-grid">
        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Command inputs</p>
              <h3>Data sources</h3>
            </div>
          </div>
          <div className="list-stack">
            {module.dataSources.map((item) => (
              <div key={item} className="list-card list-card-soft">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="soft-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Expected outcomes</p>
              <h3>What this module should produce</h3>
            </div>
          </div>
          <div className="list-stack">
            {module.outputs.map((item) => (
              <div key={item} className="list-card list-card-soft">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      {runtime.sections.map((section) => (
        <section key={`${section.eyebrow}-${section.title}`} className="section-card executive-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{section.eyebrow}</p>
              <h3>{section.title}</h3>
            </div>
            <span className="chip">{getSectionCountLabel(slug, section.items.length)}</span>
          </div>

          {section.layout === "table" ? (
            section.items.length > 0 ? (
              <div className="queue-table-shell queue-table-shell-light">
                {renderBulkActions(section)}
                <table className="queue-table">
                  <thead>
                    <tr>
                      <th scope="col">Select</th>
                      <th scope="col">Item</th>
                      <th scope="col">Signal</th>
                      <th scope="col">Context</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item) => {
                      const selectableId = getBulkSelectableId(item);

                      return (
                        <tr key={`${section.title}-${item.title}-${item.meta ?? ""}`}>
                          <td>
                            {selectableId ? (
                              <input
                                type="checkbox"
                                name="selectedIds"
                                value={selectableId}
                                form={getBulkFormId(section)}
                                data-bulk-group={getBulkSelectionGroup(section)}
                                className="queue-select-checkbox"
                                aria-label={`Select ${item.title}`}
                              />
                            ) : (
                              <span className="table-empty">-</span>
                            )}
                          </td>
                          <td>
                            {item.href ? (
                              <Link href={item.href} className="text-link text-link-strong">
                                <strong>{item.title}</strong>
                              </Link>
                            ) : (
                              <strong>{item.title}</strong>
                            )}
                          </td>
                          <td>{item.detail}</td>
                          <td>
                            {item.meta ? (
                              <small className="list-meta">{item.meta}</small>
                            ) : (
                              <span className="table-empty">No extra context</span>
                            )}
                          </td>
                          <td>
                            {item.statusLabel ? (
                              <span
                                className={`status-pill${
                                  item.statusTone ? ` ${getToneClass(item.statusTone)}` : ""
                                }`}
                              >
                                {item.statusLabel}
                              </span>
                            ) : (
                              <span className="table-empty">n/a</span>
                            )}
                          </td>
                          <td>
                            <div className="queue-table-actions">{renderItemActions(item)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              renderSectionEmptyState(section)
            )
          ) : (
            <div className="list-stack">
              {section.items.length > 0 ? (
                section.items.map((item) => (
                  <div key={`${section.title}-${item.title}-${item.meta ?? ""}`} className="list-card list-card-soft">
                    <div className="list-card-header">
                      {item.href ? (
                        <Link href={item.href} className="text-link text-link-strong">
                          <strong>{item.title}</strong>
                        </Link>
                      ) : (
                        <strong>{item.title}</strong>
                      )}
                      {item.statusLabel ? (
                        <span
                          className={`status-pill${
                            item.statusTone ? ` ${getToneClass(item.statusTone)}` : ""
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      ) : null}
                    </div>
                    <p>{item.detail}</p>
                    {item.meta ? <small className="list-meta">{item.meta}</small> : null}
                    {renderItemActions(item)}
                  </div>
                ))
              ) : (
                renderSectionEmptyState(section)
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
