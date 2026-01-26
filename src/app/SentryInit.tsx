"use client";

import { useEffect } from "react";

import { initSentryBrowser } from "@/shared/lib/monitoring/sentryBrowser";

export function SentryInit() {
  useEffect(() => {
    initSentryBrowser();
  }, []);

  return null;
}
