import { notFound } from "next/navigation";

import { SkuDetailView } from "@/components/sku-detail-view";
import { getSkuDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

type SkuDetailPageProps = {
  params: Promise<{
    externalVariantId: string;
  }>;
};

export default async function SkuDetailPage({ params }: SkuDetailPageProps) {
  const { externalVariantId } = await params;
  const response = await getSkuDetail(externalVariantId);

  if (response.notFound) {
    notFound();
  }

  return <SkuDetailView externalVariantId={externalVariantId} response={response} />;
}
