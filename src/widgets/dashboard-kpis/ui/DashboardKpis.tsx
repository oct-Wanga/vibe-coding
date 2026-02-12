"use client";

import { useMemo } from "react";

import { useProjects } from "@/entities/project";
import { useTeamMembers } from "@/entities/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

const numberFormatter = new Intl.NumberFormat("en-US");

export function DashboardKpis() {
  const projectsQuery = useProjects({});
  const teamQuery = useTeamMembers();
  const teamSize = teamQuery.data?.length ?? 0;

  const stats = useMemo(() => {
    const projects = projectsQuery.data ?? [];
    const total = projects.length;
    const active = projects.filter((project) => project.status === "active").length;
    const archived = projects.filter((project) => project.status === "archived").length;
    const activeRate = total === 0 ? 0 : Math.round((active / total) * 100);

    return {
      total,
      active,
      archived,
      activeRate,
    };
  }, [projectsQuery.data]);

  const kpis = [
    { label: "Total Projects", value: stats.total, helper: "All tracked projects" },
    { label: "Active Projects", value: stats.active, helper: `${stats.activeRate}% active` },
    { label: "Archived", value: stats.archived, helper: "Past work" },
    { label: "Team Members", value: teamSize, helper: "Active teammates" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{numberFormatter.format(kpi.value)}</div>
            <div className="text-xs text-muted-foreground">{kpi.helper}</div>
            {projectsQuery.isLoading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : null}
            {projectsQuery.isError ? (
              <div className="text-xs text-red-600">Failed to load</div>
            ) : null}
            {kpi.label === "Team Members" && teamQuery.isLoading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : null}
            {kpi.label === "Team Members" && teamQuery.isError ? (
              <div className="text-xs text-red-600">Failed to load</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
