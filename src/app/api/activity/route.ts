import { type NextRequest, NextResponse } from "next/server";

import type { Activity, ActivityType } from "@/entities/activity";
import { logError, logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/shared/supabase";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeType(value: unknown): ActivityType {
  if (value === "project" || value === "team" || value === "system") return value;
  return "system";
}

function normalizeActor(raw: UnknownRecord | undefined) {
  if (!raw) return undefined;
  const id = getString(raw.id);
  const name = getString(raw.name) ?? getString(raw.full_name) ?? getString(raw.display_name);
  if (!id || !name) return undefined;
  return { id, name };
}

function normalizeActivity(raw: UnknownRecord): Activity | null {
  const id = getString(raw.id);
  if (!id) return null;

  const type = normalizeType(raw.type);
  const message = getString(raw.message) ?? "Activity update.";
  const createdAt = getString(raw.created_at) ?? getString(raw.createdAt) ?? new Date().toISOString();
  const actor = isRecord(raw.actor) ? normalizeActor(raw.actor) : undefined;

  return {
    id,
    type,
    message,
    actor,
    createdAt,
  };
}

export async function GET(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("activity_list_missing_env", {
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
    logWarn("activity_list_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(NextResponse.json({ message: "Unauthorized" }, { status: 401 }), requestId);
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    logError("activity_list_failed", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 500 }), requestId);
  }

  const activities = (data ?? [])
    .map((item) => (isRecord(item) ? normalizeActivity(item) : null))
    .filter((item): item is Activity => Boolean(item));

  return withRequestId(NextResponse.json(activities), requestId);
}

function withRequestId<T>(response: NextResponse<T>, requestId: string): NextResponse<T> {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
