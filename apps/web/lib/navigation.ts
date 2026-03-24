export type NavigationItem = {
  href: string;
  label: string;
  caption: string;
  badge?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Executive Dashboard",
    caption: "Revenue, margin, stock risk, sync health",
    badge: "Phase 1"
  },
  {
    href: "/modules/sku-intelligence",
    label: "SKU Intelligence",
    caption: "Velocity, margin, and catalog quality"
  },
  {
    href: "/modules/pricing-engine",
    label: "Pricing Engine",
    caption: "Recommendations, guardrails, approvals"
  },
  {
    href: "/modules/inventory-control",
    label: "Inventory Control",
    caption: "Low stock, dead stock, reorder signals"
  },
  {
    href: "/modules/catalog-ai",
    label: "Catalog AI",
    caption: "Title, specs, and attribute enrichment"
  },
  {
    href: "/modules/integrations",
    label: "Integrations Hub",
    caption: "Shopify, supplier, and warehouse syncs"
  },
  {
    href: "/modules/growth-ads",
    label: "Growth & Ads",
    caption: "Future join between spend and SKU profit",
    badge: "Later"
  },
  {
    href: "/modules/alerts",
    label: "Alerts Center",
    caption: "Operational exceptions and approvals"
  },
  {
    href: "/modules/settings",
    label: "Settings & Rules",
    caption: "Automation controls and credentials"
  }
];

export const dashboardMetrics = [
  {
    label: "Tracked SKUs",
    value: "1.0M+",
    detail: "Target scale once ingestion is live"
  },
  {
    label: "Core Surfaces",
    value: "9",
    detail: "Dashboard modules in the initial shell"
  },
  {
    label: "Primary Runtime",
    value: "Node + Python",
    detail: "Operational API plus intelligence jobs"
  },
  {
    label: "Warehouse Mode",
    value: "Phase 2",
    detail: "Start in PostgreSQL, expand to BigQuery later"
  }
];

export const pipelineStages = [
  {
    name: "Ingest",
    detail: "Shopify products, inventory, orders, and supplier payloads"
  },
  {
    name: "Normalize",
    detail: "Create stable SKU mappings and sync audit records"
  },
  {
    name: "Decide",
    detail: "Pricing, catalog, and inventory recommendations"
  },
  {
    name: "Operate",
    detail: "Review, approve, monitor, and iterate from one dashboard"
  }
];
