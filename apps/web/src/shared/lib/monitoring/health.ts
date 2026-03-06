export type HealthPayload = {
  status: "ok";
  timestamp: string;
  environment: string;
  requestId?: string;
};

export type HealthLogContext = {
  status: "ok";
  environment: string;
  requestId?: string;
};

export function createHealthPayload(
  now: Date,
  environment: string,
  requestId?: string,
): HealthPayload {
  return {
    status: "ok",
    timestamp: now.toISOString(),
    environment,
    ...(requestId ? { requestId } : {}),
  };
}

export function createHealthLogContext(payload: HealthPayload): HealthLogContext {
  return {
    status: payload.status,
    environment: payload.environment,
    ...(payload.requestId ? { requestId: payload.requestId } : {}),
  };
}

export function getRuntimeEnvironment(): string {
  return process.env.NODE_ENV ?? "development";
}
