import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // Demo: 아주 단순한 체크만 (실서비스에서는 Better Auth / 쿠키 세션 / OAuth 등으로 교체)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ ok: false, message: "Missing credentials" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
