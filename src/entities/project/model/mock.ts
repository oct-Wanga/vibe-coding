import type { Project } from "../api/useProject";

export const PROJECTS: Project[] = [
  { id: "p_001", name: "Alpha", status: "active" },
  { id: "p_002", name: "Bravo", status: "archived" },
  { id: "p_003", name: "Charlie", status: "active" },
  { id: "p_004", name: "Delta", status: "active" },
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
