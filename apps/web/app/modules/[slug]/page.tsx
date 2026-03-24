import { notFound } from "next/navigation";

import { ModuleView } from "@/components/module-view";
import { moduleContent } from "@/lib/module-content";
import { getModuleRuntime } from "@/lib/module-runtime";

export const dynamic = "force-dynamic";

type ModulePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const module = moduleContent[slug];

  if (!module) {
    notFound();
  }

  const runtime = await getModuleRuntime(slug);

  return <ModuleView module={module} runtime={runtime} />;
}
