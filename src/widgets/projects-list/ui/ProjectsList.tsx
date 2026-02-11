"use client";

import { useSearchParams } from "next/navigation";
import { List } from "react-window";

import type { Project } from "@/entities/project";
import { useProjects } from "@/entities/project";
import { Item } from "@/features/project-list";
import type { ProjectStatusFilter } from "@/shared/lib/projectSearchParams";
import { readProjectsFilters } from "@/shared/lib/projectSearchParams";
import { Card, CardContent } from "@/shared/ui";

export function ProjectsList({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: ProjectStatusFilter;
}) {
  const sp = useSearchParams();
  const { q, status } = readProjectsFilters(sp, { q: initialQ, status: initialStatus });

  const projects = useProjects({
    q: q.trim() || undefined,
    status,
  });

  const testData: Project[] = [
    {
      created_at: "2021-05-05",
      id: "p_999",
      name: "Alpha",
      status: "active",
      updated_at: "2021-05-06",
    },
    {
      created_at: "2021-05-05",
      id: "p_998",
      name: "Alpha",
      status: "active",
      updated_at: "2021-05-06",
    },
    {
      created_at: "2021-05-05",
      id: "p_997",
      name: "Alpha",
      status: "active",
      updated_at: "2021-05-06",
    },
    {
      created_at: "2021-05-05",
      id: "p_996",
      name: "Alpha",
      status: "active",
      updated_at: "2021-05-06",
    },
    {
      created_at: "2021-05-05",
      id: "p_995",
      name: "Alpha",
      status: "active",
      updated_at: "2021-05-06",
    },
  ];
  const data = [...(projects?.data ?? []), ...testData];

  return (
    <Card>
      <CardContent>
        {projects.isLoading ? <div className="text-sm text-gray-500">Loading...</div> : null}
        {projects.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}

        <div className="divide-y  overflow-auto" style={{ height: "300px" }}>
          {data ? (
            <List rowCount={data.length} rowHeight={64} rowProps={{ data }} rowComponent={Item} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
