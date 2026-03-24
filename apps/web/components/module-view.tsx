import type { ModuleContent } from "@/lib/module-content";
import type { ModuleRuntime } from "@/lib/module-runtime";

type ModuleViewProps = {
  module: ModuleContent;
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

export function ModuleView({ module, runtime }: ModuleViewProps) {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">{module.maturity}</p>
            <h3>{module.title}</h3>
            <p className="hero-copy">{module.summary}</p>
          </div>

          <div className={`status-indicator is-${runtime.mode}`}>
            <span>{getModeLabel(runtime.mode)}</span>
            <strong>{runtime.metrics.length} live metrics available</strong>
          </div>
        </div>

        {runtime.reason ? (
          <div className="banner-card">
            <strong>Module note</strong>
            <p>{runtime.reason}</p>
          </div>
        ) : null}

        <div className="module-summary">
          <article className="metric-card">
            <span>Owners</span>
            <strong>{module.owners.join(" / ")}</strong>
            <p>Primary teams that should own decisions in this area.</p>
          </article>
          <article className="metric-card">
            <span>Data sources</span>
            <strong>{module.dataSources.length}</strong>
            <p>Initial upstream sources needed for this module.</p>
          </article>

          {runtime.metrics.map((metric) => (
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
              <p className="eyebrow">Inputs</p>
              <h3>Data sources</h3>
            </div>
          </div>
          <div className="list-stack">
            {module.dataSources.map((item) => (
              <div key={item} className="list-card">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Outcomes</p>
              <h3>What this module should produce</h3>
            </div>
          </div>
          <div className="list-stack">
            {module.outputs.map((item) => (
              <div key={item} className="list-card">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      {runtime.sections.map((section) => (
        <section key={`${section.eyebrow}-${section.title}`} className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{section.eyebrow}</p>
              <h3>{section.title}</h3>
            </div>
          </div>

          <div className="list-stack">
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <div key={`${section.title}-${item.title}-${item.meta ?? ""}`} className="list-card">
                  <div className="list-card-header">
                    <strong>{item.title}</strong>
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
                </div>
              ))
            ) : (
              <div className="list-card">{section.emptyState}</div>
            )}
          </div>
        </section>
      ))}

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">First builds</p>
            <h3>MVP implementation slices</h3>
          </div>
        </div>

        <div className="pipeline-grid">
          {module.firstBuilds.map((item) => (
            <article key={item} className="pipeline-card">
              <strong>{item}</strong>
              <p>Thin vertical slice to keep scope controlled while this module matures.</p>
            </article>
          ))}
        </div>
      </section>

      {module.manualSetup ? (
        <section className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Manual setup</p>
              <h3>Accounts or credentials we will need later</h3>
            </div>
          </div>

          <div className="list-stack">
            {module.manualSetup.map((item) => (
              <div key={item} className="list-card">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
