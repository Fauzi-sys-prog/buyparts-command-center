export type ModuleContent = {
  title: string;
  summary: string;
  maturity: string;
  owners: string[];
  dataSources: string[];
  outputs: string[];
  firstBuilds: string[];
  manualSetup?: string[];
};

export const moduleContent: Record<string, ModuleContent> = {
  "sku-intelligence": {
    title: "SKU Intelligence",
    summary:
      "The scorecard for every SKU across margin, velocity, data quality, and channel readiness.",
    maturity: "MVP priority",
    owners: ["Operations", "Merchandising", "Growth"],
    dataSources: ["Shopify variants", "Order lines", "Inventory snapshots"],
    outputs: [
      "Velocity leaderboard",
      "Margin flags",
      "Catalog completeness score",
      "Top movers and sleepers"
    ],
    firstBuilds: [
      "SKU performance table",
      "Variant detail drawer",
      "Filters for stock, velocity, and catalog health"
    ]
  },
  "pricing-engine": {
    title: "Pricing Engine",
    summary:
      "Recommendation-first pricing logic with guardrails before we automate any live price changes.",
    maturity: "MVP priority",
    owners: ["Pricing", "Leadership"],
    dataSources: ["Current Shopify prices", "Inventory", "Supplier costs", "Rule settings"],
    outputs: [
      "Suggested price changes",
      "Margin floor alerts",
      "Approval queue",
      "Change history"
    ],
    firstBuilds: [
      "Pricing rule definitions",
      "Recommendation batch page",
      "Approve and reject workflow"
    ]
  },
  "inventory-control": {
    title: "Inventory Control",
    summary:
      "Monitor stock risk and identify where replenishment or liquidation decisions should happen next.",
    maturity: "MVP priority",
    owners: ["Operations", "Procurement"],
    dataSources: ["Inventory levels", "Sales velocity", "Lead time settings"],
    outputs: [
      "Low-stock risk board",
      "Dead-stock candidates",
      "Reorder priority queue"
    ],
    firstBuilds: [
      "Coverage days metric",
      "Reorder status rules",
      "Alert severity tuning"
    ]
  },
  "catalog-ai": {
    title: "Catalog AI Enrichment",
    summary:
      "Turn inconsistent manufacturer data into clean, conversion-ready catalog content with human review.",
    maturity: "MVP priority",
    owners: ["Catalog", "SEO", "Operations"],
    dataSources: ["Manufacturer data", "Shopify metafields", "Approval prompts"],
    outputs: [
      "Suggested titles",
      "Structured specs",
      "Normalized attributes",
      "Approval snapshots"
    ],
    firstBuilds: [
      "Enrichment job queue",
      "Before-and-after content review",
      "Prompt and template settings"
    ]
  },
  integrations: {
    title: "Integrations Hub",
    summary:
      "Operational visibility over Shopify, suppliers, and future warehouse or ad connectors.",
    maturity: "MVP priority",
    owners: ["Engineering", "Operations"],
    dataSources: ["Webhook logs", "Sync runs", "Credential states"],
    outputs: [
      "Connection status board",
      "Sync latency metrics",
      "Failure logs",
      "Manual retry actions"
    ],
    firstBuilds: [
      "Shopify connector status",
      "Sync run timeline",
      "Credential checklist"
    ],
    manualSetup: [
      "Shopify development store and Admin API token",
      "Google Cloud project plus BigQuery service account",
      "Google Ads developer token and customer IDs",
      "Merchant Center ID plus API credentials",
      "Supplier API base URL and API key",
      "LLM provider key plus embedding and vector store credentials for RAG"
    ]
  },
  "growth-ads": {
    title: "Growth & Ads",
    summary:
      "Join campaign spend with SKU economics after the product and pricing data are trustworthy.",
    maturity: "Phase 2",
    owners: ["Growth", "Leadership"],
    dataSources: ["Google Ads", "Merchant Center", "SKU profitability"],
    outputs: [
      "ROAS by SKU cluster",
      "Promotion candidate list",
      "Catalog feed diagnostics"
    ],
    firstBuilds: [
      "BigQuery fact tables",
      "Spend-to-margin dashboard",
      "Merchant diagnostics board"
    ]
  },
  alerts: {
    title: "Alerts Center",
    summary:
      "One place to triage failed syncs, pricing anomalies, and inventory exceptions before they become revenue problems.",
    maturity: "MVP priority",
    owners: ["Operations", "Engineering"],
    dataSources: ["Sync failures", "Pricing rules", "Inventory thresholds", "Operator activity"],
    outputs: [
      "Severity-based alert queue",
      "Operator decision feed",
      "Incident ownership",
      "Resolution notes"
    ],
    firstBuilds: [
      "Alert timeline",
      "Operator activity context",
      "Assignee and status fields",
      "Quick actions for retries"
    ]
  },
  settings: {
    title: "Settings & Rules",
    summary:
      "Guardrails for pricing, AI prompts, credentials, and automation schedules.",
    maturity: "MVP priority",
    owners: ["Engineering", "Leadership"],
    dataSources: ["Environment config", "Business rules", "User roles"],
    outputs: [
      "Rule library",
      "Connector setup guide",
      "Job schedules"
    ],
    firstBuilds: [
      "Pricing thresholds",
      "Prompt presets",
      "Credential placeholders"
    ],
    manualSetup: [
      "Central env management for Shopify, BigQuery, Ads, Merchant Center, suppliers, and AI providers"
    ]
  }
};
