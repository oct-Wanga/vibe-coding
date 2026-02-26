import { type NextRequest } from "next/server";

import { isFastApiBackend } from "@/shared/config/apiBackend";
import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

import { GET as localGet, POST as localPost } from "./route.local";

export async function GET(request: NextRequest) {
  if (isFastApiBackend()) {
    const search = request.nextUrl.search;
    return proxyToFastApi(request, `/api/projects${search}`);
  }

  return localGet(request);
}

export async function POST(request: NextRequest) {
  if (isFastApiBackend()) {
    return proxyToFastApi(request, "/api/projects");
  }

  return localPost(request);
}
