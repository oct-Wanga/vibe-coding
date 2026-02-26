import { type NextRequest } from "next/server";

import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

export async function GET(request: NextRequest) {
  return proxyToFastApi(request, "/api/auth/me");
}
