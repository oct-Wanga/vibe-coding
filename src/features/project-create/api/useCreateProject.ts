"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project, ProjectsParams } from "@/entities/project";
import { projectKeys } from "@/entities/project";

type CreateProjectInput = { id: string; name: string };
type ProjectListCache = [readonly unknown[], Project[] | undefined];

async function createProject(input: CreateProjectInput) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Failed to create project");
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

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async (_data, vars) => {
      const now = new Date().toISOString();
      const nextProject: Project = {
        id: vars.id,
        name: vars.name,
        status: "active",
        created_at: now,
        updated_at: now,
      };

      const listQueries = qc.getQueriesData<Project[]>({
        queryKey: projectKeys.lists(),
      }) as ProjectListCache[];

      listQueries.forEach(([key, data]) => {
        if (!data) return;
        const params = key[key.length - 1] as ProjectsParams;
        if (!matchesListFilter(nextProject, params)) return;

        if (data.some((project) => project.id === nextProject.id)) return;

        qc.setQueryData<Project[]>(key, [nextProject, ...data]);
      });

      qc.setQueryData<Project>(projectKeys.detail(vars.id), nextProject);
      await qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
