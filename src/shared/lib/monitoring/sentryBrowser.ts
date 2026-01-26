export type SentryBrowserConfig = {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
};

function clampSampleRate(value: number): number {
  if (Number.isNaN(value)) return 0;

  return Math.min(1, Math.max(0, value));
}

export function buildSentryBrowserSnippet(config: SentryBrowserConfig): string {
  const payload = {
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: clampSampleRate(config.tracesSampleRate),
  };

  return `window.Sentry && window.Sentry.init(${JSON.stringify(payload)});`;
}
