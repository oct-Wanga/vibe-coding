import { type NextRequest } from "next/server";

import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

export async function POST(request: NextRequest) {
  return proxyToFastApi(request, "/api/auth/signup");
}
