import type { NextRequest } from "next/server";

import { captureApiError, type ApiErrorContext } from "./captureApiError";

type ParseResult<T> = { ok: true; body: T } | { ok: false; errorId: string };

export async function parseJsonBody<T>(
  req: NextRequest,
  context: Omit<ApiErrorContext, "status" | "details"> & {
    status?: number;
    details?: Record<string, unknown>;
  },
): Promise<ParseResult<T>> {
  try {
    const body = (await req.json()) as T;
    return { ok: true, body };
  } catch (error) {
    const errorId = captureApiError(error, {
      route: context.route,
      method: context.method,
      status: context.status ?? 400,
      details: {
        reason: "invalid_json",
        ...context.details,
      },
    });
    return { ok: false, errorId };
  }
}
