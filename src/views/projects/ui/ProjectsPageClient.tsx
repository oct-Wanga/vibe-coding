"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useProjects } from "@/entities/project";
import { setParam } from "@/shared/lib/searchParams";

const STATUS = ["all", "active", "archived"] as const;
type Status = (typeof STATUS)[number];

function parseStatus(value: string | null, fallback: Status): Status {
  if (!value) return fallback;
  return (STATUS as readonly string[]).includes(value) ? (value as Status) : fallback;
}

export function ProjectsPageClient({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URL → 현재값(싱글 소스는 URL)
  const currentQ = sp.get("q") ?? initialQ;
  const currentStatus = parseStatus(sp.get("status"), initialStatus);

  // 입력 UI state (타이핑 중은 로컬)
  const [q, setQ] = useState(currentQ);
  const [status, setStatus] = useState<Status>(currentStatus);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      status, // "all"도 그대로 전달 (useProjects에서 처리)
    }),
    [q, status],
  );

  const projects = useProjects(params);

  const applyToUrl = () => {
    const next = new URLSearchParams(sp.toString());
    setParam(next, "q", q.trim() || undefined);
    setParam(next, "status", status === "all" ? undefined : status);
    router.push(`${pathname}?${next.toString()}`);
  };

  const reset = () => {
    setQ("");
    setStatus("all");
    const next = new URLSearchParams(sp.toString());
    next.delete("q");
    next.delete("status");
    router.push(`${pathname}?${next.toString()}`);
  };

  // URL이 바뀌면 입력값도 동기화
  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">Projects</h1>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Search</div>
            <input
              className="h-9 w-64 rounded border px-3 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="type project name"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500">Status</div>
            <select
              className="h-9 rounded border px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <button
            className="h-9 rounded bg-black px-3 text-sm text-white"
            onClick={applyToUrl}
            type="button"
          >
            Apply
          </button>
          <button className="h-9 rounded border px-3 text-sm" onClick={reset} type="button">
            Reset
          </button>
        </div>
      </header>

      <section className="rounded-lg border p-3">
        {projects.isLoading ? <div className="text-sm text-gray-500">Loading...</div> : null}
        {projects.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}

        {projects.data ? (
          <ul className="divide-y">
            {projects.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.status}</div>
                </div>

                <Link className="text-sm underline" href={`/projects/${p.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
