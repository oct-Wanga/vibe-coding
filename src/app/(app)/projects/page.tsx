import { getEnumParam, getStringParam } from "@/shared/lib/searchParams";
import { ProjectsPageClient } from "@/views/projects";

const STATUS = ["all", "active", "archived"] as const;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = getStringParam(sp, "q") ?? "";
  const status = getEnumParam(sp, "status", STATUS) ?? "all";

  return <ProjectsPageClient initialQ={q} initialStatus={status} />;
}
