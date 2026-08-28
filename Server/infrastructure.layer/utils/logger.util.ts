/**
 * Structured logger for backend controllers and utilities.
 * Built on pino: JSON in production, pretty-printed in development.
 * Supports LOG_LEVEL, request-scoped context via AsyncLocalStorage, and PII redaction.
 */

import { AsyncLocalStorage } from "async_hooks";
import pino, { Logger as PinoLogger } from "pino";
import { trace } from "@opentelemetry/api";
import { env } from "../config/env";

const SENSITIVE_KEYS = new Set([
  "password",
  "newPassword",
  "currentPassword",
  "token",
  "refreshToken",
  "accessToken",
  "resetToken",
  "authorization",
  "cookie",
  "email",
  "phone",
]);

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: number | string;
  [key: string]: unknown;
}

const logStorage = new AsyncLocalStorage<LogContext>();

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function redactSensitive(value: unknown, key?: string | number): unknown {
  if (typeof key === "string" && isSensitiveKey(key)) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => redactSensitive(item, index));
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = redactSensitive(v, k);
    }
    return result;
  }

  return value;
}

function resolveLogLevel(): LogLevel {
  const allowed: LogLevel[] = ["debug", "info", "warn", "error"];
  const configured = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (configured && allowed.includes(configured)) return configured;
  return env.NODE_ENV === "production" ? "info" : "debug";
}

function createRootLogger(): PinoLogger {
  const level = resolveLogLevel();

  const transport =
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            messageFormat: "[{context}] {msg}",
          },
        }
      : undefined;

  return pino({
    level,
    base: { service: "trademaster-server", env: env.NODE_ENV },
    transport,
    formatters: {
      level(label) {
        return { level: label.toUpperCase() };
      },
      log(object) {
        // Merge request-scoped context automatically
        const context = logStorage.getStore();
        const span = trace.getActiveSpan();
        const traceContext = span
          ? {
              traceId: span.spanContext().traceId,
              spanId: span.spanContext().spanId,
            }
          : {};
        return { ...traceContext, ...context, ...object };
      },
    },
    redact: {
      paths: [
        "*.password",
        "*.newPassword",
        "*.currentPassword",
        "*.token",
        "*.refreshToken",
        "*.accessToken",
        "*.resetToken",
        "*.authorization",
        "*.cookie",
        "*.email",
        "*.phone",
        "password",
        "newPassword",
        "currentPassword",
        "token",
        "refreshToken",
        "accessToken",
        "resetToken",
        "authorization",
        "cookie",
        "email",
        "phone",
      ],
      censor: "[REDACTED]",
    },
  });
}

const rootLogger = createRootLogger();

function buildMeta(
  context: string,
  meta?: Record<string, unknown>
): Record<string, unknown> {
  const safeMeta = meta ? (redactSensitive(meta) as Record<string, unknown>) : {};
  return { context, ...safeMeta };
}

function buildErrorMeta(
  error: unknown,
  meta?: Record<string, unknown>
): Record<string, unknown> {
  const safeMeta = meta ? (redactSensitive(meta) as Record<string, unknown>) : {};
  const errMeta: Record<string, unknown> = { ...safeMeta };

  if (error instanceof Error) {
    errMeta.errorName = error.name;
    errMeta.errorMessage = error.message;
    if (env.NODE_ENV !== "production") {
      errMeta.stack = error.stack;
    }
  } else if (error !== undefined) {
    errMeta.rawError = String(error);
  }

  return errMeta;
}

export const logger = {
  debug(context: string, message: string, meta?: Record<string, unknown>) {
    rootLogger.debug(buildMeta(context, meta), message);
  },

  info(context: string, message: string, meta?: Record<string, unknown>) {
    rootLogger.info(buildMeta(context, meta), message);
  },

  warn(context: string, message: string, meta?: Record<string, unknown>) {
    rootLogger.warn(buildMeta(context, meta), message);
  },

  error(
    context: string,
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>
  ) {
    rootLogger.error(buildMeta(context, buildErrorMeta(error, meta)), message);
  },

  log(
    level: LogLevel,
    context: string,
    message: string,
    meta?: Record<string, unknown>
  ) {
    switch (level) {
      case "debug":
        this.debug(context, message, meta);
        break;
      case "info":
        this.info(context, message, meta);
        break;
      case "warn":
        this.warn(context, message, meta);
        break;
      case "error":
        this.error(context, message, undefined, meta);
        break;
    }
  },

  redact: redactSensitive,

  child(bindings: LogContext) {
    return {
      debug: (message: string, meta?: Record<string, unknown>) =>
        rootLogger.child(buildMeta("", bindings)).debug(buildMeta("", meta), message),
      info: (message: string, meta?: Record<string, unknown>) =>
        rootLogger.child(buildMeta("", bindings)).info(buildMeta("", meta), message),
      warn: (message: string, meta?: Record<string, unknown>) =>
        rootLogger.child(buildMeta("", bindings)).warn(buildMeta("", meta), message),
      error: (message: string, error?: unknown, meta?: Record<string, unknown>) =>
        rootLogger
          .child(buildMeta("", bindings))
          .error(buildMeta("", buildErrorMeta(error, meta)), message),
    };
  },
};

/**
 * Run code inside a request-scoped logging context.
 * Any log emitted inside the callback automatically includes the context fields.
 */
export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
  return logStorage.run(context, fn);
}

/**
 * Get the current request-scoped log context, if any.
 */
export function getLogContext(): LogContext | undefined {
  return logStorage.getStore();
}

export { rootLogger };
