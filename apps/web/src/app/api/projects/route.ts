import { type NextRequest } from "next/server";

import { bffEndpoints } from "@/shared/config/bffEndpoints";
import { handleBffRoute } from "@/shared/lib/bff/handleBffRoute";

import { GET as localGet, POST as localPost } from "./route.local";

export async function GET(request: NextRequest) {
  return handleBffRoute({
    request,
    context: undefined,
    localHandler: (req) => localGet(req),
    buildTargetPath: (req) => `${bffEndpoints.projects.list}${req.nextUrl.search}`,
  });
}

export async function POST(request: NextRequest) {
  return handleBffRoute({
    request,
    context: undefined,
    localHandler: (req) => localPost(req),
    buildTargetPath: () => bffEndpoints.projects.list,
  });
}
