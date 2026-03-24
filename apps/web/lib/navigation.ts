export type NavigationItem = {
  href: string;
  label: string;
  navLabel?: string;
  caption: string;
  shortLabel: string;
  section: "Overview" | "Operations" | "Platform";
  badge?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Executive Dashboard",
    navLabel: "Dashboard",
    caption: "Revenue, margin, stock risk, sync health",
    shortLabel: "DB",
    section: "Overview",
    badge: "Phase 1"
  },
  {
    href: "/modules/sku-intelligence",
    label: "SKU Intelligence",
    navLabel: "SKU Intelligence",
    caption: "Velocity, margin, and catalog quality",
    shortLabel: "SK",
    section: "Operations"
  },
  {
    href: "/modules/pricing-engine",
    label: "Pricing Engine",
    navLabel: "Pricing",
    caption: "Recommendations, guardrails, approvals",
    shortLabel: "PR",
    section: "Operations"
  },
  {
    href: "/modules/inventory-control",
    label: "Inventory Control",
    navLabel: "Inventory",
    caption: "Low stock, dead stock, reorder signals",
    shortLabel: "IV",
    section: "Operations"
  },
  {
    href: "/modules/catalog-ai",
    label: "Catalog AI",
    navLabel: "Catalog AI",
    caption: "Title, specs, and attribute enrichment",
    shortLabel: "CG",
    section: "Operations"
  },
  {
    href: "/modules/integrations",
    label: "Integrations Hub",
    navLabel: "Integrations",
    caption: "Shopify, supplier, and warehouse syncs",
    shortLabel: "IN",
    section: "Platform"
  },
  {
    href: "/modules/growth-ads",
    label: "Growth & Ads",
    navLabel: "Growth Ads",
    caption: "Future join between spend and SKU profit",
    shortLabel: "GR",
    section: "Platform",
    badge: "Later"
  },
  {
    href: "/modules/alerts",
    label: "Alerts Center",
    navLabel: "Alerts",
    caption: "Operational exceptions and approvals",
    shortLabel: "AL",
    section: "Platform"
  },
  {
    href: "/modules/settings",
    label: "Settings & Rules",
    navLabel: "Settings",
    caption: "Automation controls and credentials",
    shortLabel: "ST",
    section: "Platform"
  }
];

export const navigationSections = ["Overview", "Operations", "Platform"] as const;

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
