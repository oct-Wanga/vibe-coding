"use client";

import { useEffect, useState } from "react";

import { Button, Input } from "@/shared/ui";

import type { ProjectStatus } from "../model/constants";
import { PROJECT_STATUS } from "../model/constants";

export function ProjectsFilter({
  currentQ,
  currentStatus,
  onApply,
  onReset,
}: {
  currentQ: string;
  currentStatus: ProjectStatus;
  onApply: (next: { q: string; status: ProjectStatus }) => void;
  onReset: () => void;
}) {
  // 입력 중은 로컬, Apply 시 URL로 반영
  const [q, setQ] = useState(currentQ);
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);

  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <div className="text-xs text-gray-500">Search</div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="type project name" />
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Status</div>
        <select
          className="h-9 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        >
          {PROJECT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" onClick={() => onApply({ q, status })}>
        Apply
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
