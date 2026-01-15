"use client";

import Link from "next/link";

import { useProject } from "@/entities/project";
import { AppShell } from "@/widgets/app-shell";

export function ProjectDetailClient({ id }: { id: string }) {
  const project = useProject(id);

  if (project.isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (project.isError) return <div className="text-sm text-red-600">Failed to load</div>;
  if (!project.data) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="space-y-1">
          <Link className="text-sm underline" href="/projects">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">{project.data.name}</h1>
          <div className="text-sm text-gray-500">ID: {project.data.id}</div>
        </header>

        <section className="rounded-lg border p-3">
          <div className="text-sm">
            Status: <span className="font-medium">{project.data.status}</span>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
