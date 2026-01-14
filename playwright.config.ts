import "dotenv/config";

import {defineConfig} from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});
export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
