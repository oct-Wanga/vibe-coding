import { type NextRequest, NextResponse } from "next/server";

import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, insertActivityLog } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
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
  const { error: activityLogError } = await insertActivityLog(supabase, {
    type: "auth.logout",
    message: "User logged out",
    actor: claims?.claims.sub,
  });
  if (activityLogError) {
    logWarn("activity_log_insert_failed", {
      requestId,
      route,
      status: 200,
      type: "auth.logout",
    });
  }
  const response = NextResponse.json({ ok: true });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
