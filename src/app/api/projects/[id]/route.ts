import { type NextRequest } from "next/server";

import { isFastApiBackend } from "@/shared/config/apiBackend";
import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

import { DELETE as localDelete, GET as localGet, PATCH as localPatch } from "./route.local";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  if (isFastApiBackend()) {
    const { id } = await context.params;
    return proxyToFastApi(request, `/api/projects/${id}`);
  }

  return localGet(request, context);
}

export async function PATCH(request: NextRequest, context: Params) {
  if (isFastApiBackend()) {
    const { id } = await context.params;
    return proxyToFastApi(request, `/api/projects/${id}`);
  }

  return localPatch(request, context);
}

export async function DELETE(request: NextRequest, context: Params) {
  if (isFastApiBackend()) {
    const { id } = await context.params;
    return proxyToFastApi(request, `/api/projects/${id}`);
  }

  return localDelete(request, context);
}
