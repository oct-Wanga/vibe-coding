import { type NextRequest, NextResponse } from "next/server";

import { logWarn, REQUEST_ID_HEADER, resolveRequestId } from "@/shared/lib/monitoring";
import { createSupabaseServerClient } from "@/shared/supabase";

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

  const response = NextResponse.json({ user: data });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
