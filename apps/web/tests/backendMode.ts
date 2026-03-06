export const backendMode = process.env.API_BACKEND === "fastapi" ? "fastapi" : "route";

export const isFastApiBackend = backendMode === "fastapi";
export const isRouteBackend = backendMode === "route";
