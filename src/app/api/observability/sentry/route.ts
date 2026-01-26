import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  });
}
