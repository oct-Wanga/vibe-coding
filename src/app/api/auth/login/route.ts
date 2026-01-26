import { type NextRequest, NextResponse } from "next/server";

import { parseJsonBody } from "@/shared/lib/monitoring";
import { createSupabaseServerClient } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const parsed = await parseJsonBody<{ email?: string; password?: string }>(req, {
    route: "/api/auth/login",
    method: req.method,
  });
  if (!parsed.ok) {
    return NextResponse.json({ message: "invalid json", errorId: parsed.errorId }, { status: 400 });
  }
  const body = parsed.body;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "email/password required" }, { status: 400 });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) return NextResponse.json({ message: error.message }, { status: 401 });

  return NextResponse.json({ ok: true });
}
