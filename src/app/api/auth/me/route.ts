import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // 문서 권장: 서버 보호는 claims 기반으로 :contentReference[oaicite:9]{index=9}
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: data });
}
