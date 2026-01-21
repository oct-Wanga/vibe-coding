"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectKeys } from "@/entities/project";

type CreateProjectInput = { id: string; name: string };

async function createProject(input: CreateProjectInput) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Failed to create project");
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
