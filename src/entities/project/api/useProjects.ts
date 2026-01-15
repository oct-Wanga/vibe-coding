"use client";

import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../model/keys";
import type { Project } from "./useProject";

export type ProjectsParams = {
  q?: string;
  status?: "active" | "archived" | "all";
};

async function fetchProjects(params: ProjectsParams): Promise<Project[]> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status && params.status !== "all") sp.set("status", params.status);

  const res = await fetch(`/api/projects?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return (await res.json()) as Project[];
}

export function useProjects(params: ProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjects(params),
  });
}
