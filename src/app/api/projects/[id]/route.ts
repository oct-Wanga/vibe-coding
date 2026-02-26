import { type NextRequest } from "next/server";

import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  const { id } = await context.params;
  return proxyToFastApi(request, `/api/projects/${id}`);
}

export async function PATCH(request: NextRequest, context: Params) {
  const { id } = await context.params;
  return proxyToFastApi(request, `/api/projects/${id}`);
}

export async function DELETE(request: NextRequest, context: Params) {
  const { id } = await context.params;
  return proxyToFastApi(request, `/api/projects/${id}`);
}
