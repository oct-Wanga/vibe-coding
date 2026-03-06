"use client";

import { Button } from "@/shared/ui";

import { useArchiveProject } from "../api/useArchiveProject";

export function ProjectArchiveToggle({
  id,
  status,
}: {
  id: string;
  status: "active" | "archived";
}) {
  const mutation = useArchiveProject();
  const nextStatus = status === "archived" ? "active" : "archived";

  const handleToggle = () => {
    if (mutation.isPending) return;
    mutation.mutate({ id, status: nextStatus });
  };

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={handleToggle} disabled={mutation.isPending}>
        {nextStatus === "archived" ? "보관" : "복원"}
      </Button>
      {mutation.isError ? <div className="text-xs text-red-600">상태 변경 실패</div> : null}
    </div>
  );
}
