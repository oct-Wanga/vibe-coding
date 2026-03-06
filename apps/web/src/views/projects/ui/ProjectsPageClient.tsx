"use client";

import { ProjectCreateForm } from "@/features/project-create";
import { ProjectsFilter } from "@/features/projects-filter";
import type { ProjectStatusFilter } from "@/shared/lib/projectSearchParams";
import { ProjectsList } from "@/widgets/projects-list";

export function ProjectsPageClient({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: ProjectStatusFilter;
}) {
  return (
    <div className="space-y-4">
      <ProjectCreateForm />
      <ProjectsFilter initialQ={initialQ} initialStatus={initialStatus} />
      <ProjectsList initialQ={initialQ} initialStatus={initialStatus} />
    </div>
  );
}
