"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProject } from "@/entities/project";

import { projectKeys } from "../model/keys";

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });
}
