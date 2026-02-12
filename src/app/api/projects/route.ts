import { type NextRequest, NextResponse } from "next/server";

import { logError, logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/shared/supabase";

function withRequestId<T>(response: NextResponse<T>, requestId: string): NextResponse<T> {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export async function GET(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("projects_list_missing_env", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(
      NextResponse.json({ message: "Supabase env missing" }, { status: 500 }),
      requestId,
    );
  }

  const supabase = await createSupabaseServerClient();

  // 보호: claims 기반 검증 권장 :contentReference[oaicite:11]{index=11}
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    logWarn("projects_list_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      requestId,
    );
  }

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
  if (error) {
    logError("projects_list_failed", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 500 }), requestId);
  }

  return withRequestId(NextResponse.json(data ?? []), requestId);
}

export async function POST(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("projects_create_missing_env", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(
      NextResponse.json({ message: "Supabase env missing" }, { status: 500 }),
      requestId,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: claims } = await supabase.auth.getClaims();
  const body = (await req.json().catch(() => null)) as { id?: string; name?: string } | null;
  if (!body?.id || !body?.name) {
    logWarn("projects_create_validation_failed", {
      requestId,
      route,
      status: 400,
    });
    return withRequestId(
      NextResponse.json({ message: "id/name required" }, { status: 400 }),
      requestId,
    );
  }
  if (!claims) {
    logWarn("projects_create_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      requestId,
    );
  }

  // user_id는 RLS 정책(INSERT with check) 때문에 반드시 auth.uid()와 일치해야 함
  const { error } = await supabase.from("projects").insert({
    id: body.id,
    name: body.name,
    status: "active",
    user_id: claims.claims.sub, // auth uid
  });

  if (error) {
    logWarn("projects_create_failed", {
      requestId,
      route,
      status: 400,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 400 }), requestId);
  }

  return withRequestId(NextResponse.json({ ok: true }, { status: 201 }), requestId);
}
