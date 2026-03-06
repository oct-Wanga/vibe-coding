"use client";

import { useQuery } from "@tanstack/react-query";

import type { Project } from "@/entities/project";

import { projectKeys } from "../../model/keys";

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch project");
  return (await res.json()) as Project;
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });
}
