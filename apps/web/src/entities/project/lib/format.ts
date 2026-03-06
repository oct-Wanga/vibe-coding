import type { Project } from "../model/project";

export function formatProjectLabel(project: Pick<Project, "name" | "status">) {
  return project.status === "archived" ? `${project.name} (archived)` : project.name;
}
