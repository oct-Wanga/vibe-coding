import { describe, expect, it } from "vitest";

import { buildSentryBrowserSnippet } from "./sentryBrowser";

describe("buildSentryBrowserSnippet", () => {
  it("creates a snippet with normalized sample rate", () => {
    const snippet = buildSentryBrowserSnippet({
      dsn: "https://example@sentry.io/123",
      environment: "test",
      tracesSampleRate: 1.5,
    });

    expect(snippet).toContain("window.Sentry.init");
    expect(snippet).toContain("\"tracesSampleRate\":1");
  });
});
