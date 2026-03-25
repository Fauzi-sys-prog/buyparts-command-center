import { DashboardHome } from "@/components/dashboard-home";
import { getActionFeedback } from "@/lib/action-feedback";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const feedback = getActionFeedback(resolvedSearchParams);
  const range: "24h" | "7d" | "30d" | undefined =
    typeof resolvedSearchParams.range === "string" &&
    ["24h", "7d", "30d"].includes(resolvedSearchParams.range)
      ? (resolvedSearchParams.range as "24h" | "7d" | "30d")
      : undefined;
  const filters = {
    pricingStatus:
      typeof resolvedSearchParams.pricingStatus === "string"
        ? resolvedSearchParams.pricingStatus
        : undefined,
    pricingQ: typeof resolvedSearchParams.pricingQ === "string" ? resolvedSearchParams.pricingQ : undefined,
    catalogStatus:
      typeof resolvedSearchParams.catalogStatus === "string"
        ? resolvedSearchParams.catalogStatus
        : undefined,
    catalogQ: typeof resolvedSearchParams.catalogQ === "string" ? resolvedSearchParams.catalogQ : undefined
  };

  return <DashboardHome feedback={feedback} filters={filters} range={range} />;
}
