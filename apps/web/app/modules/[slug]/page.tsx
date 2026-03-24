import { notFound } from "next/navigation";

import { ModuleView } from "@/components/module-view";
import { getActionFeedback } from "@/lib/action-feedback";
import { moduleContent } from "@/lib/module-content";
import { getModuleRuntime } from "@/lib/module-runtime";

export const dynamic = "force-dynamic";

type ModulePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ModulePage({ params, searchParams }: ModulePageProps) {
  const { slug } = await params;
  const module = moduleContent[slug];
  const resolvedSearchParams = await searchParams;
  const feedback = getActionFeedback(resolvedSearchParams);
  const filters = {
    status:
      typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined,
    q: typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined,
    sort: typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined
  };

  if (!module) {
    notFound();
  }

  const runtime = await getModuleRuntime(slug, filters);

  return <ModuleView feedback={feedback} filters={filters} module={module} runtime={runtime} slug={slug} />;
}
