import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;

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
