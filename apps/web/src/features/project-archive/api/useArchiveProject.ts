"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project, ProjectsParams } from "@/entities/project";
import { matchesProjectsParams, projectKeys } from "@/entities/project";

type ArchiveInput = { id: string; status: "active" | "archived" };
type ProjectListCache = [readonly unknown[], Project[] | undefined];

async function patchProjectStatus(input: ArchiveInput) {
  const res = await fetch(`/api/projects/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status: input.status }),
  });

  if (!res.ok) throw new Error("Failed to update project");
}

export function useArchiveProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: patchProjectStatus,

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: projectKeys.detail(id) });
      await qc.cancelQueries({ queryKey: projectKeys.lists() });

      const prev = qc.getQueryData<Project>(projectKeys.detail(id));
      const prevLists = qc.getQueriesData<Project[]>({
        queryKey: projectKeys.lists(),
      }) as ProjectListCache[];
      if (prev) qc.setQueryData<Project>(projectKeys.detail(id), { ...prev, status });

      prevLists.forEach(([key, data]) => {
        if (!data) return;
        const params = key[key.length - 1] as ProjectsParams;
        const next = data
          .map((project) => (project.id === id ? { ...project, status } : project))
          .filter((project) => matchesProjectsParams(project, params));

        qc.setQueryData<Project[]>(key, next);
      });

      return { prev, prevLists };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(projectKeys.detail(vars.id), ctx.prev);
      ctx?.prevLists.forEach(([key, data]) => {
        qc.setQueryData<Project[]>(key, data);
      });
    },

    onSettled: async (_d, _e, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.detail(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
