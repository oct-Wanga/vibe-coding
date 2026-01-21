import type { Project } from "@/entities/project";

export const PROJECTS: Project[] = [
  {
    id: "p_001",
    name: "Alpha",
    status: "active",
    created_at: "2021-05-05",
    updated_at: "2021-05-06",
  },
  {
    id: "p_002",
    name: "Bravo",
    status: "archived",
    created_at: "2021-05-04",
    updated_at: "2021-05-07",
  },
  {
    id: "p_003",
    name: "Charlie",
    status: "active",
    created_at: "2021-05-03",
    updated_at: "2021-05-08",
  },
  {
    id: "p_004",
    name: "Delta",
    status: "active",
    created_at: "2021-05-02",
    updated_at: "2021-05-09",
  },
];

export function findProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function filterProjects(params: { q?: string; status?: "active" | "archived" }): Project[] {
  const q = params.q?.trim().toLowerCase() ?? "";
  const status = params.status;

  return PROJECTS.filter((p) => {
    const matchQ = q.length === 0 ? true : p.name.toLowerCase().includes(q);
    const matchStatus = status ? p.status === status : true;
    return matchQ && matchStatus;
  });
}
