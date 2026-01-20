export type ProjectId = string;
export type ProjectStatus = "active" | "archived";

export type Project = {
  id: ProjectId;
  name: string;
  status: ProjectStatus;
};

export type ProjectsParams = {
  q?: string;
  status?: "active" | "archived" | "all";
};

export function isArchived(project: Pick<Project, "status">) {
  return project.status === "archived";
}
