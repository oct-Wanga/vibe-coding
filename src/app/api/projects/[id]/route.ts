import { type NextRequest, NextResponse } from "next/server";

import { logError, logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/shared/supabase";

function withRequestId<T>(response: NextResponse<T>, requestId: string): NextResponse<T> {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("projects_get_missing_env", {
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
  if (!claims) {
    logWarn("projects_get_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      requestId,
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logError("projects_get_failed", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 500 }), requestId);
  }
  if (!data) {
    logWarn("projects_get_not_found", {
      requestId,
      route,
      status: 404,
    });
    return withRequestId(NextResponse.json({ message: "Not found" }, { status: 404 }), requestId);
  }

  return withRequestId(NextResponse.json(data), requestId);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("projects_update_missing_env", {
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
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    status?: "active" | "archived";
  } | null;
  if (!body?.name && !body?.status) {
    logWarn("projects_update_validation_failed", {
      requestId,
      route,
      status: 400,
    });
    return withRequestId(
      NextResponse.json({ message: "nothing to update" }, { status: 400 }),
      requestId,
    );
  }
  if (!claims) {
    logWarn("projects_update_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      requestId,
    );
  }

  const { error } = await supabase
    .from("projects")
    .update({
      ...(body.name ? { name: body.name } : {}),
      ...(body.status ? { status: body.status } : {}),
    })
    .eq("id", id);

  if (error) {
    logWarn("projects_update_failed", {
      requestId,
      route,
      status: 400,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 400 }), requestId);
  }

  return withRequestId(NextResponse.json({ ok: true }), requestId);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;

  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("projects_delete_missing_env", {
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
  if (!claims) {
    logWarn("projects_delete_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      requestId,
    );
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    logWarn("projects_delete_failed", {
      requestId,
      route,
      status: 400,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 400 }), requestId);
  }

  return withRequestId(NextResponse.json({ ok: true }), requestId);
}
