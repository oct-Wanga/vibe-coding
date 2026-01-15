import { NextResponse } from "next/server";

import { filterProjects } from "@/entities/project";

export function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const list = filterProjects({
    q,
    status: status === "active" || status === "archived" ? status : undefined,
  });

  return NextResponse.json(list);
}
