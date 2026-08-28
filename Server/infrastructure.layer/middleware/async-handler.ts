/**
 * Async route handler wrapper.
 * Catches rejected promises and forwards them to Express error middleware.
 * Express 5 handles this natively, but the wrapper makes intent explicit and
 * keeps route handler signatures clean.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
