import { describe, expect, it } from "vitest";

import { buildSentryBrowserConfig } from "./sentryBrowser";

describe("buildSentryBrowserConfig", () => {
  it("normalizes sample rate to the 0~1 range", () => {
    const config = buildSentryBrowserConfig({
      dsn: "https://example@sentry.io/123",
      environment: "test",
      tracesSampleRate: 1.5,
    });

    expect(config).toEqual({
      dsn: "https://example@sentry.io/123",
      environment: "test",
      tracesSampleRate: 1,
    });
  });
});
