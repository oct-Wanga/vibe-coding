"use client";

import Link from "next/link";

import { useProject } from "@/entities/project";
import { Badge, Card, CardContent, CardHeader } from "@/shared/ui";

export function ProjectDetailClient({ id }: { id: string }) {
  const project = useProject(id);

  if (project.isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (project.isError) return <div className="text-sm text-red-600">Failed to load</div>;
  if (!project.data) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className="space-y-4">
      <Link className="text-sm underline" href="/projects">
        ← Back
      </Link>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">{project.data.name}</h1>
          <div className="text-sm text-gray-500">ID: {project.data.id}</div>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <div className="text-sm">Status</div>
          <Badge>{project.data.status}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
