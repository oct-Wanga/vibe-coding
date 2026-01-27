import { PROJECT_STATUS } from "@/shared/lib/projectSearchParams";
import { getEnumParam, getStringParam } from "@/shared/lib/searchParams";
import { ProjectsPageClient } from "@/views/projects";

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams;

  const q = getStringParam(sp, "q") ?? "";
  const status = getEnumParam(sp, "status", PROJECT_STATUS) ?? "all";

  return <ProjectsPageClient initialQ={q} initialStatus={status} />;
}
