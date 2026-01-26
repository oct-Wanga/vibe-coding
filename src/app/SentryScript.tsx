import { buildSentryBrowserSnippet } from "@/shared/lib/monitoring/sentryBrowser";

const DEFAULT_SAMPLE_RATE = 0.1;

function parseSampleRate(value: string | undefined): number {
  if (!value) return DEFAULT_SAMPLE_RATE;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? DEFAULT_SAMPLE_RATE : parsed;
}

export function SentryScript() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  const environment =
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    process.env.NODE_ENV ??
    "development";

  const tracesSampleRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  );

  const snippet = buildSentryBrowserSnippet({
    dsn,
    environment,
    tracesSampleRate,
  });

  return (
    <>
      <script
        src="https://browser.sentry-cdn.com/7.120.1/bundle.tracing.min.js"
        crossOrigin="anonymous"
      />
      <script
        id="sentry-init"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
    </>
  );
}
