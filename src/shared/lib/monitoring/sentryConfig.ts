const DEFAULT_SAMPLE_RATE = 0.1;

function clampSampleRate(value: number): number {
  if (Number.isNaN(value)) return 0;

  return Math.min(1, Math.max(0, value));
}

function parseSampleRate(value: string | undefined): number {
  if (!value) return DEFAULT_SAMPLE_RATE;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? DEFAULT_SAMPLE_RATE : parsed;
}

function resolveEnvironment(env: NodeJS.ProcessEnv): string {
  return (
    env.SENTRY_ENVIRONMENT ??
    env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    env.NODE_ENV ??
    "development"
  );
}

export function getSentryClientConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  return {
    dsn,
    environment: resolveEnvironment(env),
    tracesSampleRate: clampSampleRate(
      parseSampleRate(env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
    ),
  };
}

export function getSentryServerConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  const dsn = env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  return {
    dsn,
    environment: resolveEnvironment(env),
    tracesSampleRate: clampSampleRate(
      parseSampleRate(env.SENTRY_TRACES_SAMPLE_RATE),
    ),
  };
}
