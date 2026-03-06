import { type NextRequest } from "next/server";

import { ensureRequestId, REQUEST_ID_HEADER } from "@/shared/lib/monitoring";
import { updateSession } from "@/shared/supabase/proxy";

export async function proxy(request: NextRequest) {
  const requestId = ensureRequestId(request.headers.get(REQUEST_ID_HEADER), () =>
    crypto.randomUUID(),
  );

  const response = await updateSession(request);
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
