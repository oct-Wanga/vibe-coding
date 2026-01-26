import * as Sentry from "@sentry/nextjs";

export type SentryBrowserConfig = {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
};

const DEFAULT_SAMPLE_RATE = 0.1;
let hasInitialized = false;

function clampSampleRate(value: number): number {
  if (Number.isNaN(value)) return 0;

  return Math.min(1, Math.max(0, value));
}

export function buildSentryBrowserConfig(
  config: SentryBrowserConfig,
): SentryBrowserConfig {
  return {
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: clampSampleRate(config.tracesSampleRate),
  };
}

function parseSampleRate(value: string | undefined): number {
  if (!value) return DEFAULT_SAMPLE_RATE;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? DEFAULT_SAMPLE_RATE : parsed;
}

export function initSentryBrowser(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (hasInitialized) return;

  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const environment =
    env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? env.NODE_ENV ?? "development";
  const tracesSampleRate = parseSampleRate(
    env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  );

  Sentry.init(
    buildSentryBrowserConfig({
      dsn,
      environment,
      tracesSampleRate,
    }),
  );

  hasInitialized = true;
}
