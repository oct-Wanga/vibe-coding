"use client";

import { useMemo } from "react";

import { useProjects } from "@/entities/project";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/shared/ui";

export function DashboardRecentProjects() {
  const projectsQuery = useProjects({});

  const recent = useMemo(() => {
    const data = projectsQuery.data ?? [];
    return [...data]
      .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
      .slice(0, 4);
  }, [projectsQuery.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {projectsQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : null}
        {projectsQuery.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}
        {!projectsQuery.isLoading && recent.length === 0 ? (
          <EmptyState
            title="No projects yet."
            description="Create your first project to see it here."
          />
        ) : null}
        {recent.length > 0 ? (
          <ul className="space-y-3">
            {recent.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{project.name}</div>
                  <div className="text-xs text-muted-foreground">Updated {project.updated_at}</div>
                </div>
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
