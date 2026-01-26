import { NextResponse } from "next/server";

import { createHealthPayload, getRuntimeEnvironment } from "@/shared/lib/monitoring";

export function GET() {
  const payload = createHealthPayload(new Date(), getRuntimeEnvironment());

  return NextResponse.json(payload);
}
