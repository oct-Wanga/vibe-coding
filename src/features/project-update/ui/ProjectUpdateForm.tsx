"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Input } from "@/shared/ui";

import { useUpdateProject } from "../api/useUpdateProject";

export function ProjectUpdateForm({
  id,
  initialName,
}: {
  id: string;
  initialName: string;
}) {
  const mutation = useUpdateProject();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const isInvalid = useMemo(() => name.trim().length === 0, [name]);
  const hasChanged = name.trim() !== initialName.trim();

  const handleSubmit = () => {
    if (!hasChanged || isInvalid || mutation.isPending) return;
    mutation.mutate({ id, name: name.trim() });
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">프로젝트 이름 변경</div>
      <div className="flex flex-wrap items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="w-64" />
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!hasChanged || isInvalid || mutation.isPending}
        >
          변경
        </Button>
        {mutation.isError ? (
          <div className="text-xs text-red-600">변경 실패</div>
        ) : null}
        {mutation.isSuccess ? <div className="text-xs text-green-600">변경 완료</div> : null}
      </div>
    </div>
  );
}
