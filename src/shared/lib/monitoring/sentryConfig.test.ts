import { describe, expect, it } from "vitest";

import { getSentryClientConfig, getSentryServerConfig } from "./sentryConfig";

describe("getSentryClientConfig", () => {
  it("returns null when client DSN is missing", () => {
    const config = getSentryClientConfig({});

    expect(config).toBeNull();
  });

  it("normalizes traces sample rate for client config", () => {
    const config = getSentryClientConfig({
      NEXT_PUBLIC_SENTRY_DSN: "https://example@sentry.io/123",
      NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: "2.5",
      NODE_ENV: "test",
    });

    expect(config).toEqual({
      dsn: "https://example@sentry.io/123",
      environment: "test",
      tracesSampleRate: 1,
    });
  });
});

describe("getSentryServerConfig", () => {
  it("prefers server DSN when available", () => {
    const config = getSentryServerConfig({
      SENTRY_DSN: "https://server@sentry.io/456",
      NEXT_PUBLIC_SENTRY_DSN: "https://client@sentry.io/123",
      NODE_ENV: "production",
    });

    expect(config).toEqual({
      dsn: "https://server@sentry.io/456",
      environment: "production",
      tracesSampleRate: 0.1,
    });
  });
});
