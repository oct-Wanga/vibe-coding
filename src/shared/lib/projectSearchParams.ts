import { getEnumParam, getStringParam } from "./searchParams";

export const PROJECT_STATUS = ["all", "active", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export function readProjectsFilters(
  sp: URLSearchParams,
  fallback: { q: string; status: ProjectStatus },
) {
  const q = getStringParam(sp, "q") ?? fallback.q;
  const status = getEnumParam(sp, "status", PROJECT_STATUS) ?? fallback.status;

  return { q, status };
}
