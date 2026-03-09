import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  ...(isWindows ? {} : { output: "standalone" }),
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
