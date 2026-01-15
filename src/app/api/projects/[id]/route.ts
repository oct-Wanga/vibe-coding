import { NextResponse } from "next/server";

import { findProject } from "@/entities/project";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = await ctx.params;

  const project = findProject(id);

  if (!project) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
