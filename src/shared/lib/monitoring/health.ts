export type HealthPayload = {
  status: "ok";
  timestamp: string;
  environment: string;
};

export function createHealthPayload(now: Date, environment: string): HealthPayload {
  return {
    status: "ok",
    timestamp: now.toISOString(),
    environment,
  };
}

export function getRuntimeEnvironment(): string {
  return process.env.NODE_ENV ?? "development";
}
