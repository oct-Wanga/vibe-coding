"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project, ProjectsParams } from "@/entities/project";
import { projectKeys } from "@/entities/project";

type UpdateProjectInput = { id: string; name: string };
type ProjectListCache = [readonly unknown[], Project[] | undefined];

async function updateProject(input: UpdateProjectInput) {
  const res = await fetch(`/api/projects/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: input.name }),
  });

  if (!res.ok) throw new Error("Failed to update project");
}

function matchesListFilter(project: Project, params: ProjectsParams) {
  if (params.status && params.status !== "all" && project.status !== params.status) {
    return false;
  }

  if (params.q && !project.name.toLowerCase().includes(params.q.toLowerCase())) {
    return false;
  }

  return true;
}

export function useUpdateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: projectKeys.detail(id) });
      await qc.cancelQueries({ queryKey: projectKeys.lists() });

      const prev = qc.getQueryData<Project>(projectKeys.detail(id));
      const prevLists = qc.getQueriesData<Project[]>({
        queryKey: projectKeys.lists(),
      }) as ProjectListCache[];

      if (prev) qc.setQueryData<Project>(projectKeys.detail(id), { ...prev, name });

      prevLists.forEach(([key, data]) => {
        if (!data) return;
        const params = key[key.length - 1] as ProjectsParams;
        const next = data
          .map((project) => (project.id === id ? { ...project, name } : project))
          .filter((project) => matchesListFilter(project, params));

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
