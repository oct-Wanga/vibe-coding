"use client";

import { useMemo, useState } from "react";

import { Button, Card, CardContent, CardHeader, Input } from "@/shared/ui";

import { useCreateProject } from "../api/useCreateProject";

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `p_${Date.now()}`;
}

export function ProjectCreateForm() {
  const mutation = useCreateProject();
  const [name, setName] = useState("");
  const [id, setId] = useState(() => createProjectId());

  const isInvalid = useMemo(() => name.trim().length === 0, [name]);

  const handleSubmit = () => {
    if (isInvalid || mutation.isPending) return;

    mutation.mutate(
      { id, name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setId(createProjectId());
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">새 프로젝트</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">프로젝트 이름</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프로젝트 이름"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">프로젝트 ID</div>
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="자동 생성됨" />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleSubmit} disabled={isInvalid || mutation.isPending}>
            생성
          </Button>
          {mutation.isError ? <div className="text-xs text-red-600">생성에 실패했어요.</div> : null}
          {mutation.isSuccess ? <div className="text-xs text-green-600">생성 완료</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
