"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useProjects } from "@/entities/project";
import type { ProjectStatusFilter } from "@/shared/lib/projectSearchParams";
import { readProjectsFilters } from "@/shared/lib/projectSearchParams";
import { Badge, Card, CardContent } from "@/shared/ui";

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

  return (
    <Card>
      <CardContent>
        {projects.isLoading ? <div className="text-sm text-gray-500">Loading...</div> : null}
        {projects.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}

        {projects.data ? (
          <ul className="divide-y">
            {projects.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <Badge>{p.status}</Badge>
                </div>

                <Link className="text-sm underline" href={`/projects/${p.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
