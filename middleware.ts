import { NextResponse, type NextRequest } from "next/server";

import { ensureRequestId, REQUEST_ID_HEADER } from "@/shared/lib/monitoring";

function createRequestId(): string {
  return crypto.randomUUID();
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestId = ensureRequestId(
    requestHeaders.get(REQUEST_ID_HEADER),
    createRequestId,
  );

  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
