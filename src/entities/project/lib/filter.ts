import type { Project, ProjectsParams } from "../model/project";

export function matchesProjectsParams(project: Project, params: ProjectsParams) {
  if (params.status && params.status !== "all" && project.status !== params.status) {
    return false;
  }

  if (params.q && !project.name.toLowerCase().includes(params.q.toLowerCase())) {
    return false;
  }

  return true;
}
