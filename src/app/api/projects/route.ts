import { type NextRequest, NextResponse } from "next/server";

import { createMockProject, getMockProjects } from "@/entities/project";
import {
  createSupabaseServerClient,
  hasSupabaseEnv,
  shouldUseMockProjects,
} from "@/shared/supabase";

function filterMockProjects(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const status = sp.get("status");

  const mockProjects = getMockProjects();
  const normalizedStatus = status === "active" || status === "archived" ? status : undefined;
  return mockProjects.filter((project) => {
    const matchesQ = q.length === 0 ? true : project.name.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = normalizedStatus ? project.status === normalizedStatus : true;
    return matchesQ && matchesStatus;
  });
}

export async function GET(req: NextRequest) {
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) return NextResponse.json(filterMockProjects(req));

  const supabase = await createSupabaseServerClient();

  // 보호: claims 기반 검증 권장 :contentReference[oaicite:11]{index=11}
  const { data: claims } = await supabase.auth.getClaims();
  const useMock = shouldUseMockProjects({ hasEnv, hasClaims: Boolean(claims) });
  if (useMock) return NextResponse.json(filterMockProjects(req));
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
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    const body = (await req.json().catch(() => null)) as { id?: string; name?: string } | null;
    if (!body?.id || !body?.name) {
      return NextResponse.json({ message: "id/name required" }, { status: 400 });
    }

    const project = createMockProject({ id: body.id, name: body.name });
    return NextResponse.json(project, { status: 201 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: claims } = await supabase.auth.getClaims();
  const useMock = shouldUseMockProjects({ hasEnv, hasClaims: Boolean(claims) });
  const body = (await req.json().catch(() => null)) as { id?: string; name?: string } | null;
  if (!body?.id || !body?.name) {
    return NextResponse.json({ message: "id/name required" }, { status: 400 });
  }
  if (useMock) {
    const project = createMockProject({ id: body.id, name: body.name });
    return NextResponse.json(project, { status: 201 });
  }
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
