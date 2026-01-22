"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProjectStatusFilter } from "@/shared/lib/projectSearchParams";
import { PROJECT_STATUS, readProjectsFilters } from "@/shared/lib/projectSearchParams";
import { setParam } from "@/shared/lib/searchParams";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

export function ProjectsFilter({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: ProjectStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // ✅ URL이 싱글 소스(현재 적용된 값)
  const { q: currentQ, status: currentStatus } = readProjectsFilters(sp, {
    q: initialQ,
    status: initialStatus,
  });

  // ✅ 입력 중(draft)은 로컬
  const [draftQ, setDraftQ] = useState(currentQ);
  const [draftStatus, setDraftStatus] = useState<ProjectStatusFilter>(currentStatus);

  // URL이 바뀌면 draft도 동기화
  useEffect(() => {
    setDraftQ(currentQ);
  }, [currentQ]);

  useEffect(() => {
    setDraftStatus(currentStatus);
  }, [currentStatus]);

  const applyToUrl = () => {
    const next = new URLSearchParams(sp.toString());
    setParam(next, "q", draftQ.trim() || undefined);
    setParam(next, "status", draftStatus === "all" ? undefined : draftStatus);
    router.push(`${pathname}?${next.toString()}`);
  };

  const reset = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete("q");
    next.delete("status");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Projects</h1>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Search</div>
              <div className="w-64">
                <Input
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value)}
                  placeholder="type project name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500">Status</div>

              {/* ✅ shadcn Select */}
              <Select
                value={draftStatus}
                onValueChange={(v) => setDraftStatus(v as ProjectStatusFilter)}
              >
                <SelectTrigger className="w-[180px]" data-testid="project-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="w-[180px] mt-1">
                  {PROJECT_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="button" onClick={applyToUrl}>
              Apply
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
