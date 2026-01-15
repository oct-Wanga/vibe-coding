"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PROJECT_STATUS, ProjectsFilter, type ProjectStatus } from "@/features/projects-filter";
import { getEnumParam, getStringParam, setParam } from "@/shared/lib/searchParams";
import { Card, CardContent, CardHeader } from "@/shared/ui";
import { ProjectsList } from "@/widgets/projects-list";

function parseStatusFromUrl(sp: URLSearchParams, fallback: ProjectStatus): ProjectStatus {
  return getEnumParam(sp, "status", PROJECT_STATUS) ?? fallback;
}

export function ProjectsPageClient({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: ProjectStatus;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URL이 싱글 소스
  const currentQ = getStringParam(sp, "q") ?? initialQ;
  const currentStatus = parseStatusFromUrl(sp, initialStatus);

  const applyToUrl = (next: { q: string; status: ProjectStatus }) => {
    const nextSp = new URLSearchParams(sp.toString());
    setParam(nextSp, "q", next.q.trim() || undefined);
    setParam(nextSp, "status", next.status === "all" ? undefined : next.status);
    router.push(`${pathname}?${nextSp.toString()}`);
  };

  const reset = () => {
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete("q");
    nextSp.delete("status");
    router.push(`${pathname}?${nextSp.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Projects</h1>
        </CardHeader>
        <CardContent>
          <ProjectsFilter
            currentQ={currentQ}
            currentStatus={currentStatus}
            onApply={applyToUrl}
            onReset={reset}
          />
        </CardContent>
      </Card>

      <ProjectsList q={currentQ} status={currentStatus} />
    </div>
  );
}
