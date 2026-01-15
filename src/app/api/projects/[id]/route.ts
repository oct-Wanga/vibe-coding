import { type NextRequest, NextResponse } from "next/server";

import { findProject } from "@/entities/project";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const project = findProject(id);

  if (!project) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
