import * as Sentry from "@sentry/nextjs";

import { getSentryClientConfig } from "@/shared/lib/monitoring/sentryConfig";

const config = getSentryClientConfig();

if (config) {
  Sentry.init(config);
}
