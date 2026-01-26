"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui";

import { useDeleteProject } from "../api/useDeleteProject";

export function ProjectDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const mutation = useDeleteProject();
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    mutation.mutate(
      { id },
      {
        onSuccess: () => {
          router.push("/projects");
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={mutation.isPending}
      >
        {confirmed ? "정말 삭제" : "삭제"}
      </Button>
      {confirmed ? (
        <div className="text-xs text-gray-500">한 번 더 클릭하면 삭제됩니다.</div>
      ) : null}
      {mutation.isError ? <div className="text-xs text-red-600">삭제 실패</div> : null}
    </div>
  );
}
