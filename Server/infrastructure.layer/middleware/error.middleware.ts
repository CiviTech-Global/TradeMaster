/**
 * Centralized Express error handler.
 * Must be mounted as the last middleware in the application stack.
 */

import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors/app-error";
import { logger } from "../utils/logger.util";
import { Sentry } from "../utils/sentry";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error("ERROR", `Operational ${err.code}`, err, {
        requestId,
        path: req.originalUrl,
        method: req.method,
        statusCode: err.statusCode,
      });
      Sentry.withScope((scope) => {
        scope.setTag("requestId", requestId);
        scope.setTag("code", err.code);
        Sentry.captureException(err);
      });
    }

    const body: Record<string, unknown> = {
      error: err.message,
      code: err.code,
      requestId,
    };

    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown error — log full details, capture to Sentry, and return a generic message
  logger.error("ERROR", "Unhandled error", err, {
    requestId,
    path: req.originalUrl,
    method: req.method,
  });
  Sentry.withScope((scope) => {
    scope.setTag("requestId", requestId);
    Sentry.captureException(err);
  });

  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
    code: "INTERNAL_ERROR",
    requestId,
  });
}
