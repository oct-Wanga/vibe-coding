"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProjects } from "@/entities/project";

import { projectKeys } from "../model/keys";
import type { ProjectsParams } from "../model/project";

export function useProjects(params: ProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjects(params),
  });
}
