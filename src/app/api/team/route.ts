import { type NextRequest, NextResponse } from "next/server";

import type { User } from "@/entities/user";
import { logError, logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/shared/supabase";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeUser(raw: UnknownRecord): User | null {
  const id = getString(raw.id);
  if (!id) return null;

  const name =
    getString(raw.name) ??
    getString(raw.full_name) ??
    getString(raw.display_name) ??
    null;
  const email = getString(raw.email) ?? "";
  const imageUrl = getString(raw.image_url) ?? getString(raw.avatar_url) ?? null;
  const roleRaw = getString(raw.role);
  const role = roleRaw === "admin" || roleRaw === "member" ? roleRaw : undefined;

  return {
    id,
    email,
    name,
    imageUrl,
    role,
  };
}

export async function GET(req: NextRequest) {
  const requestId = resolveRequestId(req.headers, () => crypto.randomUUID());
  const route = new URL(req.url).pathname;
  const hasEnv = hasSupabaseEnv();
  if (!hasEnv) {
    logError("team_list_missing_env", {
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
    logWarn("team_list_unauthorized", {
      requestId,
      route,
      status: 401,
    });
    return withRequestId(NextResponse.json({ message: "Unauthorized" }, { status: 401 }), requestId);
  }

  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    logError("team_list_failed", {
      requestId,
      route,
      status: 500,
    });
    return withRequestId(NextResponse.json({ message: error.message }, { status: 500 }), requestId);
  }

  const users = (data ?? [])
    .map((item) => (isRecord(item) ? normalizeUser(item) : null))
    .filter((item): item is User => Boolean(item));

  return withRequestId(NextResponse.json(users), requestId);
}

function withRequestId<T>(response: NextResponse<T>, requestId: string): NextResponse<T> {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
