import { notFound } from "next/navigation";

import { ModuleView } from "@/components/module-view";
import { moduleContent } from "@/lib/module-content";

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

  return <ModuleView module={module} />;
}
