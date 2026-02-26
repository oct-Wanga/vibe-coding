import { type NextRequest } from "next/server";

import { isFastApiBackend } from "@/shared/config/apiBackend";
import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

import { GET as localGet } from "./route.local";

export async function GET(request: NextRequest) {
  if (isFastApiBackend()) {
    return proxyToFastApi(request, "/api/health");
  }

  return localGet();
}
