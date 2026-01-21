import { type NextRequest } from "next/server";

import { updateSession } from "@/shared/supabase";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
      필요한 경로만 적용해도 됨
      (정적/이미지/파비콘 제외 패턴은 Supabase 문서 예시 참고) :contentReference[oaicite:8]{index=8}
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
