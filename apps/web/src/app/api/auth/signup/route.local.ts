import { type NextRequest, NextResponse } from "next/server";

import type { SignupBody } from "@/entities/user";
import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, insertActivityLog } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const supabase = await createSupabaseServerClient();
  const body = (await req.json().catch(() => null)) as SignupBody;

  const email = body.email.trim();
  const password = body.password;

  if (!email || !password) {
    logWarn("auth_signup_validation_failed", {
      requestId,
      route,
      status: 400,
    });
    const response = NextResponse.json({ message: "email/password required" }, { status: 400 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Supabase 에러 메시지 그대로 전달(운영에선 매핑해도 됨)
    logWarn("auth_signup_failed", {
      requestId,
      route,
      status: 400,
    });
    const response = NextResponse.json({ message: error.message }, { status: 400 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const { error: activityLogError } = await insertActivityLog(supabase, {
    type: "auth.signup",
    message: "User signed up",
    actor: data.user?.id ?? email,
  });
  if (activityLogError) {
    logWarn("activity_log_insert_failed", {
      requestId,
      route,
      status: 200,
      type: "auth.signup",
    });
  }

  // 이메일 인증을 켜둔 경우, user는 생성되지만 session이 없을 수 있음
  const response = NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
    needsEmailConfirm: data.session === null,
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
