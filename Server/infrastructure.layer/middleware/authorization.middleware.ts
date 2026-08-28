import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/jwt.util";
import { logger } from "../utils/logger.util";
import { AuthenticationError, AuthorizationError, BadRequestError } from "../errors/app-error";
import { recordFailure } from "../../application.layer/services/audit.service";

/**
 * Ensures the authenticated user can only access or mutate their own resource.
 * The route parameter name defaults to "id" and can be overridden via options.
 */
export function requireOwnership(
  options: { paramName?: string; allowAdmin?: boolean } = {}
) {
  const { paramName = "id", allowAdmin = false } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      logger.warn("AUTHZ", "Ownership check without authentication", {
        url: req.originalUrl,
        method: req.method,
      });
      return next(new AuthenticationError("Authentication required"));
    }

    const resourceId = parseInt(req.params[paramName], 10);
    if (Number.isNaN(resourceId)) {
      return next(new BadRequestError(`Invalid ${paramName}`));
    }

    if (allowAdmin && (authenticatedUser as any).role === "admin") {
      return next();
    }

    if (authenticatedUser.id !== resourceId) {
      logger.warn("AUTHZ", "User attempted to access another user's resource", {
        actorId: authenticatedUser.id,
        resourceId,
        url: req.originalUrl,
        method: req.method,
      });
      recordFailure(
        {
          actorId: authenticatedUser.id,
          action: "security:ownership_violation",
          resource: "user",
          resourceId,
          metadata: { url: req.originalUrl, method: req.method },
        },
        req
      );
      return next(new AuthorizationError("Access denied"));
    }

    next();
  };
}
