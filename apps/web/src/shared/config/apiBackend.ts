export type ApiBackend = "route" | "fastapi";

export function resolveApiBackend(): ApiBackend {
  return process.env.API_BACKEND === "fastapi" ? "fastapi" : "route";
}

export function isFastApiBackend(): boolean {
  return resolveApiBackend() === "fastapi";
}
