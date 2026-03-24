import type { ModuleContent } from "@/lib/module-content";

type ModuleViewProps = {
  module: ModuleContent;
};

export function ModuleView({ module }: ModuleViewProps) {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">{module.maturity}</p>
          <h3>{module.title}</h3>
          <p className="hero-copy">{module.summary}</p>
        </div>

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
