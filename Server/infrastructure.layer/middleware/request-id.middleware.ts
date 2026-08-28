/**
 * Request ID middleware.
 * Generates or reuses a correlation ID for every incoming request and stores it
 * in AsyncLocalStorage so that loggers can include it automatically.
 */

import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { runWithLogContext, getLogContext, LogContext } from "../utils/logger.util";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

const REQUEST_ID_HEADER = "x-request-id";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId =
    (typeof req.headers[REQUEST_ID_HEADER] === "string"
      ? req.headers[REQUEST_ID_HEADER]
      : undefined) || randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  // Parse userId lazily so we don't require the auth middleware to run first.
  const context: LogContext = { requestId };

  runWithLogContext(context, () => {
    // Attach a helper to update context after auth middleware runs
    (req as Request & { setLogContext?: (update: LogContext) => void }).setLogContext = (
      update: LogContext
    ) => {
      const current = getLogContext() || {};
      Object.assign(current, update);
    };

    next();
  });
}

export function setUserLogContext(req: Request, userId: number | string): void {
  const ctx = getLogContext();
  if (ctx) {
    ctx.userId = userId;
  }
}
