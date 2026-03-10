import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";
const REQUEST_ID_HEADER = "x-request-id";

function buildHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  const requestId = request.headers.get(REQUEST_ID_HEADER);

  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);
  if (requestId) headers.set(REQUEST_ID_HEADER, requestId);

  return headers;
}

export async function proxyToFastApi(
  request: NextRequest,
  targetPath: string,
): Promise<NextResponse> {
  const method = request.method;
  const headers = buildHeaders(request);
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${FASTAPI_BASE_URL}${targetPath}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (error) {
    const upstreamError =
      error instanceof Error ? error : new Error("FastAPI upstream request failed");
    Sentry.captureException(upstreamError);
    const response = NextResponse.json(
      { message: "FastAPI upstream unavailable" },
      { status: 503 },
    );
    const requestId = request.headers.get(REQUEST_ID_HEADER);
    if (requestId) {
      response.headers.set(REQUEST_ID_HEADER, requestId);
    }
    return response;
  }

  const text = await upstreamResponse.text();
  const response = new NextResponse(text, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/json",
    },
  });

  const setCookie = upstreamResponse.headers.get("set-cookie");
  const upstreamRequestId = upstreamResponse.headers.get(REQUEST_ID_HEADER);

  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }
  if (upstreamRequestId) {
    response.headers.set(REQUEST_ID_HEADER, upstreamRequestId);
  }

  return response;
}
