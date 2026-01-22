import { type NextRequest, NextResponse } from "next/server";

import { filterProjects } from "@/entities/project";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/shared/supabase";

export async function GET(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const status = sp.get("status");

    return NextResponse.json(
      filterProjects({
        q,
        status: status === "active" || status === "archived" ? status : undefined,
      }),
    );
  }

  const supabase = await createSupabaseServerClient();

  // 보호: claims 기반 검증 권장 :contentReference[oaicite:11]{index=11}
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const status = sp.get("status"); // active|archived|null

  let query = supabase
    .from("projects")
    .select("id,name,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (status === "active" || status === "archived") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    const body = (await req.json().catch(() => null)) as { id?: string; name?: string } | null;
    if (!body?.id || !body?.name) {
      return NextResponse.json({ message: "id/name required" }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { id?: string; name?: string } | null;
  if (!body?.id || !body?.name) {
    return NextResponse.json({ message: "id/name required" }, { status: 400 });
  }

  // user_id는 RLS 정책(INSERT with check) 때문에 반드시 auth.uid()와 일치해야 함
  const { error } = await supabase.from("projects").insert({
    id: body.id,
    name: body.name,
    status: "active",
    user_id: claims.claims.sub, // auth uid
  });

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
