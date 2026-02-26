import { type NextRequest, NextResponse } from "next/server";

import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, insertActivityLog } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const supabase = await createSupabaseServerClient();
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;

  if (!body?.email || !body?.password) {
    logWarn("auth_login_validation_failed", {
      requestId,
      route,
      status: 400,
    });
    const response = NextResponse.json({ message: "email/password required" }, { status: 400 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    logWarn("auth_login_failed", {
      requestId,
      route,
      status: 401,
    });
    const response = NextResponse.json({ message: error.message }, { status: 401 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const { error: activityLogError } = await insertActivityLog(supabase, {
    type: "auth.login",
    message: "User logged in",
    actor: data.user?.id ?? body.email,
  });
  if (activityLogError) {
    logWarn("activity_log_insert_failed", {
      requestId,
      route,
      status: 200,
      type: "auth.login",
    });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
