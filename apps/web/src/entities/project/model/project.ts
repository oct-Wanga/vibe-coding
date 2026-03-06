import type { Project, ProjectsParams, ProjectStatus } from "@repo/contracts/project";

export type { Project, ProjectsParams, ProjectStatus };

export function isArchived(project: Pick<Project, "status">) {
  return project.status === "archived";
}
