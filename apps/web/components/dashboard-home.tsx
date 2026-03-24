import Link from "next/link";

import { moduleContent } from "@/lib/module-content";
import { dashboardMetrics, pipelineStages } from "@/lib/navigation";

export function DashboardHome() {
  const modules = Object.entries(moduleContent);

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Mission control</p>
          <h3>Build the operating system behind pricing, inventory, and catalog growth.</h3>
          <p className="hero-copy">
            This starter shell turns our earlier planning into something concrete: one command
            center for SKU health, automation jobs, integration reliability, and future warehouse
            analytics.
          </p>
        </div>

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
