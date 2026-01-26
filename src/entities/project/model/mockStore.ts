import { PROJECTS } from "./mock";
import type { Project } from "./project";

let mockProjects = [...PROJECTS];

export function getMockProjects() {
  return mockProjects;
}

export function findMockProject(id: string) {
  return mockProjects.find((project) => project.id === id);
}

export function createMockProject(input: { id: string; name: string }) {
  const now = new Date().toISOString();
  const project: Project = {
    id: input.id,
    name: input.name,
    status: "active",
    created_at: now,
    updated_at: now,
  };

  mockProjects = [project, ...mockProjects];

  return project;
}

export function updateMockProject(id: string, patch: Partial<Pick<Project, "name" | "status">>) {
  const project = findMockProject(id);
  if (!project) return undefined;

  const updated: Project = {
    ...project,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  mockProjects = mockProjects.map((item) => (item.id === id ? updated : item));

  return updated;
}

export function deleteMockProject(id: string) {
  const prevLength = mockProjects.length;
  mockProjects = mockProjects.filter((project) => project.id !== id);

  return mockProjects.length !== prevLength;
}
