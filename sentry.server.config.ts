import * as Sentry from "@sentry/nextjs";

import { getSentryServerConfig } from "@/shared/lib/monitoring/sentryConfig";

const config = getSentryServerConfig();

if (config) {
  Sentry.init(config);
}
