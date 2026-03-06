import { type NextRequest } from "next/server";

import { isFastApiBackend } from "@/shared/config/apiBackend";
import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

import { POST as localPost } from "./route.local";

export async function POST(request: NextRequest) {
  if (isFastApiBackend()) {
    return proxyToFastApi(request, "/api/auth/login");
  }

  return localPost(request);
}
