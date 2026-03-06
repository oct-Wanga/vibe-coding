import { headers } from "next/headers";
import { NextResponse } from "next/server";

import {
  createHealthLogContext,
  createHealthPayload,
  getRuntimeEnvironment,
  logInfo,
  REQUEST_ID_HEADER,
  resolveRequestId,
} from "@/shared/lib/monitoring";

export async function GET() {
  const requestHeaders = await headers();
  const requestId = resolveRequestId(requestHeaders, () => crypto.randomUUID());
  const payload = createHealthPayload(new Date(), getRuntimeEnvironment(), requestId);
  logInfo("health_check", createHealthLogContext(payload));

  const response = NextResponse.json(payload);
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}
