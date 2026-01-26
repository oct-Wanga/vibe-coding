export const REQUEST_ID_HEADER = "x-request-id";

type RequestIdGenerator = () => string;

export function ensureRequestId(
  existing: string | null,
  generate: RequestIdGenerator,
): string {
  return existing && existing.length > 0 ? existing : generate();
}

export function getRequestId(headers: Headers): string | undefined {
  return headers.get(REQUEST_ID_HEADER) ?? undefined;
}
