import { vi } from "vitest";

export const captureException = vi.fn();
export const captureRequestError = vi.fn();
export const captureRouterTransitionStart = vi.fn();
export const init = vi.fn();
export const replayIntegration = vi.fn(() => ({}));
