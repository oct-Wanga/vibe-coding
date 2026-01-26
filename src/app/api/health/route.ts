import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  createHealthPayload,
  ensureRequestId,
  getRequestId,
  getRuntimeEnvironment,
  REQUEST_ID_HEADER,
} from "@/shared/lib/monitoring";

export async function GET() {
  const requestHeaders = await headers();
  const requestId = ensureRequestId(getRequestId(requestHeaders) ?? null, () =>
    crypto.randomUUID(),
  );
  const payload = createHealthPayload(new Date(), getRuntimeEnvironment(), requestId);

  const response = NextResponse.json(payload);
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}
