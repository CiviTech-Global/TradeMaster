/**
 * Structured logger for backend controllers and utilities.
 * Logs with consistent format: [LEVEL] [context] message
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

function formatLog(level: LogLevel, context: string, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] [${level}] [${context}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    line += ` | ${JSON.stringify(meta)}`;
  }
  return line;
}

export const logger = {
  debug(context: string, message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") return;
    console.log(formatLog("DEBUG", context, message, meta));
  },
  info(context: string, message: string, meta?: Record<string, unknown>) {
    console.log(formatLog("INFO", context, message, meta));
  },
  warn(context: string, message: string, meta?: Record<string, unknown>) {
    console.warn(formatLog("WARN", context, message, meta));
  },
  error(context: string, message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errMeta: Record<string, unknown> = { ...meta };
    if (error instanceof Error) {
      errMeta.errorName = error.name;
      errMeta.errorMessage = error.message;
      if (process.env.NODE_ENV !== "production") {
        errMeta.stack = error.stack;
      }
    } else if (error !== undefined) {
      errMeta.rawError = String(error);
    }
    console.error(formatLog("ERROR", context, message, errMeta));
  },
};
