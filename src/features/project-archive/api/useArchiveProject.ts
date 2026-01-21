"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@/entities/project";
import { projectKeys } from "@/entities/project";

type ArchiveInput = { id: string; status: "active" | "archived" };

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

      const prev = qc.getQueryData<Project>(projectKeys.detail(id));
      if (prev) qc.setQueryData<Project>(projectKeys.detail(id), { ...prev, status });

      return { prev };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(projectKeys.detail(vars.id), ctx.prev);
    },

    onSettled: async (_d, _e, vars) => {
      await qc.invalidateQueries({ queryKey: projectKeys.detail(vars.id) });
      await qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
