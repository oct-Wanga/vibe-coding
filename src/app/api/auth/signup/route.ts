import { type NextRequest, NextResponse } from "next/server";

import type { SignupBody } from "@/entities/user";
import { createSupabaseServerClient } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const body = (await req.json().catch(() => null)) as SignupBody;

  const email = body.email.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ message: "email/password required" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Supabase 에러 메시지 그대로 전달(운영에선 매핑해도 됨)
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // 이메일 인증을 켜둔 경우, user는 생성되지만 session이 없을 수 있음
  return NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
    needsEmailConfirm: data.session == null,
  });
}
