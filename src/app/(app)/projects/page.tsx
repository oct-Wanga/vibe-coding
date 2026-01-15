import { PROJECT_STATUS } from "@/features/projects-filter";
import { getEnumParam, getStringParam } from "@/shared/lib/searchParams";
import { ProjectsPageClient } from "@/views/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = getStringParam(sp, "q") ?? "";
  const status = getEnumParam(sp, "status", PROJECT_STATUS) ?? "all";

  return <ProjectsPageClient initialQ={q} initialStatus={status} />;
}
