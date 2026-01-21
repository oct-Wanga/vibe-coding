"use client";

import { useQuery } from "@tanstack/react-query";

import type { Project, ProjectsParams } from "@/entities/project";

import { projectKeys } from "../../model/keys";

async function fetchProjects(params: ProjectsParams): Promise<Project[]> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status && params.status !== "all") sp.set("status", params.status);

  const qs = sp.toString();
  const res = await fetch(`/api/projects${qs ? `?${qs}` : ""}`);

  if (!res.ok) throw new Error("Failed to fetch projects");
  return (await res.json()) as Project[];
}

export function useProjects(params: ProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjects(params),
  });
}
