import { type NextRequest, NextResponse } from "next/server";

import { deleteMockProject, findMockProject, updateMockProject } from "@/entities/project";
import { createSupabaseServerClient, hasSupabaseEnv, shouldUseMockProjects } from "@/shared/supabase";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    const project = findMockProject(id);
    if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(project);
  }

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const useMock = shouldUseMockProjects({ hasEnv, hasClaims: Boolean(claims) });
  if (useMock) {
    const project = findMockProject(id);
    if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(project);
  }
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    const body = (await req.json().catch(() => null)) as {
      name?: string;
      status?: "active" | "archived";
    } | null;
    if (!body?.name && !body?.status) {
      return NextResponse.json({ message: "nothing to update" }, { status: 400 });
    }

    const updated = updateMockProject(id, {
      ...(body.name ? { name: body.name } : {}),
      ...(body.status ? { status: body.status } : {}),
    });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const useMock = shouldUseMockProjects({ hasEnv, hasClaims: Boolean(claims) });
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    status?: "active" | "archived";
  } | null;
  if (!body?.name && !body?.status) {
    return NextResponse.json({ message: "nothing to update" }, { status: 400 });
  }
  if (useMock) {
    const updated = updateMockProject(id, {
      ...(body.name ? { name: body.name } : {}),
      ...(body.status ? { status: body.status } : {}),
    });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  }
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("projects")
    .update({
      ...(body.name ? { name: body.name } : {}),
      ...(body.status ? { status: body.status } : {}),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    const deleted = deleteMockProject(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const useMock = shouldUseMockProjects({ hasEnv, hasClaims: Boolean(claims) });
  if (useMock) {
    const deleted = deleteMockProject(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  }
  if (!claims) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
