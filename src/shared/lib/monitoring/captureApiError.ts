import * as Sentry from "@sentry/nextjs";
import { randomUUID } from "crypto";

export type ApiErrorContext = {
  route: string;
  method: string;
  status: number;
  details?: Record<string, unknown>;
};

export function captureApiError(error: unknown, context: ApiErrorContext) {
  const errorId = randomUUID();

  Sentry.captureException(error, {
    level: "error",
    tags: {
      route: context.route,
      method: context.method,
      status: String(context.status),
      error_id: errorId,
    },
    extra: context.details,
  });

  return errorId;
}
