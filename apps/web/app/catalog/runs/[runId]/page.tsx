import { notFound } from "next/navigation";

import { CatalogRunDetailView } from "@/components/catalog-run-detail-view";
import { getActionFeedback } from "@/lib/action-feedback";
import { getCatalogRunDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

type CatalogRunPageProps = {
  params: Promise<{
    runId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogRunPage({ params, searchParams }: CatalogRunPageProps) {
  const { runId } = await params;
  const response = await getCatalogRunDetail(runId);
  const feedback = getActionFeedback(await searchParams);

  if (response.notFound) {
    notFound();
  }

  return <CatalogRunDetailView feedback={feedback} runId={runId} response={response} />;
}
