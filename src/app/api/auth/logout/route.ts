import { type NextRequest, NextResponse } from "next/server";

import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    logWarn("auth_logout_failed", {
      requestId,
      route,
      status: 400,
    });
    const response = NextResponse.json({ message: error.message }, { status: 400 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }
  const response = NextResponse.json({ ok: true });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
