"use client";

import Link from "next/link";

import { useProjects } from "@/entities/project";
import type { ProjectStatus } from "@/features/projects-filter";
import { Badge, Card, CardContent } from "@/shared/ui";

export function ProjectsList({ q, status }: { q: string; status: ProjectStatus }) {
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
