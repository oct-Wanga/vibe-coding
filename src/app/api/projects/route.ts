import { type NextRequest } from "next/server";

import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  return proxyToFastApi(request, `/api/projects${search}`);
}

export async function POST(request: NextRequest) {
  return proxyToFastApi(request, "/api/projects");
}
