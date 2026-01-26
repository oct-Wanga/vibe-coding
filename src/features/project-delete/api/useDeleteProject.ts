"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@/entities/project";
import { projectKeys } from "@/entities/project";

type DeleteProjectInput = { id: string };
type ProjectListCache = [readonly unknown[], Project[] | undefined];

async function deleteProject(input: DeleteProjectInput) {
  const res = await fetch(`/api/projects/${input.id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete project");
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: projectKeys.lists() });

      const prevLists = qc.getQueriesData<Project[]>({
        queryKey: projectKeys.lists(),
      }) as ProjectListCache[];

      prevLists.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData<Project[]>(
          key,
          data.filter((project) => project.id !== id),
        );
      });

      return { prevLists };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prevLists.forEach(([key, data]) => {
        qc.setQueryData<Project[]>(key, data);
      });
    },
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.lists() });
      await qc.removeQueries({ queryKey: projectKeys.detail(vars.id) });
    },
  });
}
