type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown> | undefined;

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
};

export function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  now: Date = new Date(),
): string {
  const payload: LogPayload = {
    level,
    message,
    timestamp: now.toISOString(),
    ...(context ? { context } : {}),
  };

  return JSON.stringify(payload);
}

export function logInfo(message: string, context?: LogContext) {
  console.info(formatLog("info", message, context));
}

export function logWarn(message: string, context?: LogContext) {
  console.warn(formatLog("warn", message, context));
}

export function logError(message: string, context?: LogContext) {
  console.error(formatLog("error", message, context));
}
