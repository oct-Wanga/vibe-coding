export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectsParams = {
  q?: string;
  status?: ProjectStatus | "all";
};
