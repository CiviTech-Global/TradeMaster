import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../infrastructure.layer/errors/app-error";
import {
  getUserByEmailQuery,
  createPasswordResetTokenQuery,
  verifyPasswordResetTokenQuery,
  resetUserPasswordQuery
} from "../../infrastructure.layer/utils/auth.util";
import { createUserQuery } from "../../infrastructure.layer/utils/user.util";

import {
  generateTokens,
  verifyAccessToken,
  verifyAndValidateRefreshToken,
  extractAccessToken,
  getTokenExpiryDate,
  AuthenticatedRequest
} from "../../infrastructure.layer/utils/jwt.util";
import {
  storeRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens
} from "../../infrastructure.layer/utils/refresh-token.util";
import { setAuthCookies, clearAuthCookies } from "../../infrastructure.layer/utils/cookie.util";
import { env } from "../../infrastructure.layer/config/env";
import bcrypt from "bcrypt";
import { logger } from "../../infrastructure.layer/utils/logger.util";
import { recordSuccess, recordFailure } from "../../application.layer/services/audit.service";

const PRIVACY_POLICY_VERSION = "1.0.0";
const TERMS_VERSION = "1.0.0";

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Get user by email (including password for authentication)
    const user = await getUserByEmailQuery(email, true);
    if (!user) {
      recordFailure(
        { action: "auth:signin", resource: "user", metadata: { reason: "invalid_email" } },
        req
      );
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordFailure(
        { actorId: user.id, action: "auth:signin", resource: "user", metadata: { reason: "invalid_password" } },
        req
      );
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    // Generate JWT tokens and persist the refresh token for revocation/rotation
    const tokens = generateTokens(user.id, user.email);
    await storeRefreshToken(
      user.id,
      tokens.refreshToken,
      getTokenExpiryDate(env.JWT_REFRESH_EXPIRES_IN)
    );

    // Set httpOnly cookies for web clients; mobile clients can read tokens from the body.
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    recordSuccess(
      { actorId: user.id, action: "auth:signin", resource: "user", resourceId: user.id },
      req
    );

    res.json({
      data: {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: "Signin successful"
    });
  } catch (error) {
    logger.error("AUTH", "Error during signin", error);
    next(new InternalError("Signin failed"));
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstname, lastname, email, password, consent_given, privacy_policy_version, terms_version } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: firstname, lastname, email, password"
      });
    }

    if (consent_given !== true) {
      return res.status(400).json({
        error: "You must agree to the Privacy Policy and Terms of Service to create an account"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existingUser = await getUserByEmailQuery(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const newUser = await createUserQuery({
      firstname,
      lastname,
      email,
      password,
      consent_given: true,
      consent_given_at: new Date(),
      privacy_policy_version: privacy_policy_version || PRIVACY_POLICY_VERSION,
      terms_version: terms_version || TERMS_VERSION,
    });
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    // Generate JWT tokens for immediate sign-in after signup and persist refresh token
    const tokens = generateTokens(newUser.id, newUser.email);
    await storeRefreshToken(
      newUser.id,
      tokens.refreshToken,
      getTokenExpiryDate(env.JWT_REFRESH_EXPIRES_IN)
    );

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    recordSuccess(
      { actorId: newUser.id, action: "auth:signup", resource: "user", resourceId: newUser.id },
      req
    );

    res.status(201).json({
      data: {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: "Signup successful"
    });
  } catch (error) {
    logger.error("AUTH", "Error during signup", error);
    next(new InternalError("Signup failed"));
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await getUserByEmailQuery(email);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Create password reset token
    const resetToken = await createPasswordResetTokenQuery(user.id);

    // In a real application, send email with reset link here.
    // NEVER log the raw reset token; it is equivalent to a temporary password.
    res.json({
      message: "Password reset link has been sent to your email"
    });
  } catch (error) {
    logger.error("AUTH", "Error during forgot password", error);
    next(new InternalError("Failed to process password reset request"));
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Reset token and new password are required"
      });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Verify reset token and get user ID
    const userId = await verifyPasswordResetTokenQuery(token);
    if (!userId) {
      return res.status(400).json({
        error: "Invalid or expired reset token"
      });
    }

    // Reset password and invalidate all existing sessions
    await resetUserPasswordQuery(userId, newPassword);
    await revokeAllUserRefreshTokens(userId);

    recordSuccess(
      { actorId: userId, action: "auth:password_reset", resource: "user", resourceId: userId },
      req
    );

    res.json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    logger.error("AUTH", "Error during password reset", error);
    next(new InternalError("Failed to reset password"));
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractAccessToken(req as AuthenticatedRequest);
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        code: "TOKEN_MISSING"
      });
    }

    // Verify JWT token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: "Invalid or expired token",
        code: "TOKEN_INVALID"
      });
    }

    // Get user by ID to verify user still exists
    const user = await getUserByEmailQuery('', false, decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      data: {
        user: userWithoutPassword,
        valid: true,
        expiresAt: new Date(decoded.exp! * 1000).toISOString()
      },
      message: "Token is valid"
    });
  } catch (error) {
    logger.error("AUTH", "Error during token verification", error);
    next(new InternalError("Token verification failed"));
  }
}

export async function signout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let userId = req.user?.id;

    // If the access token was missing/expired, fall back to the refresh token
    // to identify the user so their sessions can still be revoked.
    if (!userId) {
      const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
      if (refreshToken) {
        const decoded = await verifyAndValidateRefreshToken(refreshToken);
        userId = decoded?.userId;
      }
    }

    if (userId) {
      await revokeAllUserRefreshTokens(userId);
      logger.info("AUTH", "User signed out and refresh tokens revoked", { userId });
      recordSuccess(
        { actorId: userId, action: "auth:signout", resource: "user", resourceId: userId },
        req
      );
    }
    clearAuthCookies(res);
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    logger.error("AUTH", "Error during signout", error);
    next(new InternalError("Signout failed"));
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept refresh token from request body (mobile) or httpOnly cookie (web).
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required",
        code: "REFRESH_TOKEN_MISSING"
      });
    }

    // Verify refresh JWT and ensure it has not been revoked
    const decoded = await verifyAndValidateRefreshToken(refreshToken);
    if (!decoded) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: "Invalid or expired refresh token",
        code: "REFRESH_TOKEN_INVALID"
      });
    }

    // Get user to verify they still exist
    const user = await getUserByEmailQuery('', false, decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Rotate: issue a new token pair and revoke the consumed refresh token
    const tokens = generateTokens(user.id, user.email);
    await Promise.all([
      storeRefreshToken(
        user.id,
        tokens.refreshToken,
        getTokenExpiryDate(env.JWT_REFRESH_EXPIRES_IN)
      ),
      revokeRefreshToken(refreshToken, tokens.refreshToken),
    ]);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user.toJSON();

    recordSuccess(
      { actorId: user.id, action: "auth:token_refreshed", resource: "user", resourceId: user.id },
      req
    );

    res.json({
      data: {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: "Token refreshed successfully"
    });
  } catch (error) {
    logger.error("AUTH", "Error during token refresh", error);
    next(new InternalError("Token refresh failed"));
  }
}