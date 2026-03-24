import { notFound } from "next/navigation";

import { SkuDetailView } from "@/components/sku-detail-view";
import { getActionFeedback } from "@/lib/action-feedback";
import { getSkuDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

type SkuDetailPageProps = {
  params: Promise<{
    externalVariantId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SkuDetailPage({ params, searchParams }: SkuDetailPageProps) {
  const { externalVariantId } = await params;
  const response = await getSkuDetail(externalVariantId);
  const feedback = getActionFeedback(await searchParams);

  if (response.notFound) {
    notFound();
  }

  return <SkuDetailView externalVariantId={externalVariantId} feedback={feedback} response={response} />;
}
