import { type NextRequest, NextResponse } from "next/server";

import type { User } from "@/entities/user";
import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient } from "@/shared/supabase";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeUser(claims: UnknownRecord): User | null {
  const id = getString(claims.sub);
  if (!id) return null;

  const userMetadata = isRecord(claims.user_metadata) ? claims.user_metadata : undefined;
  const appMetadata = isRecord(claims.app_metadata) ? claims.app_metadata : undefined;

  const email = getString(claims.email) ?? getString(userMetadata?.email) ?? "";
  const name =
    getString(userMetadata?.name) ??
    getString(userMetadata?.full_name) ??
    getString(claims.name) ??
    null;
  const imageUrl = getString(userMetadata?.avatar_url) ?? null;
  const roleRaw = getString(appMetadata?.role) ?? getString(claims.role);
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
  const supabase = await createSupabaseServerClient();

  // 문서 권장: 서버 보호는 claims 기반으로 :contentReference[oaicite:9]{index=9}
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    if (error) {
      logWarn("auth_me_failed", {
        requestId,
        route,
        status: 200,
      });
    }
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const claims = isRecord(data.claims) ? data.claims : null;
  const user = claims ? normalizeUser(claims) : null;
  const response = NextResponse.json({ user });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
