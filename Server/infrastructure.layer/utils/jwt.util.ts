import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.util';
import { env } from '../config/env';
import { AuthenticationError } from '../errors/app-error';
import { setUserLogContext } from '../middleware/request-id.middleware';
import { isRefreshTokenValid } from './refresh-token.util';

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = env;

export interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: number, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string | number,
    issuer: 'trademaster',
    audience: 'trademaster-users'
  } as SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: number, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as string | number,
    issuer: 'trademaster',
    audience: 'trademaster-users'
  } as SignOptions);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(userId: number, email: string) {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
    expiresIn: JWT_EXPIRES_IN
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'trademaster',
      audience: 'trademaster-users'
    }) as JWTPayload;

    if (decoded.type !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.error('JWT', 'JWT verification failed', error);
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'trademaster',
      audience: 'trademaster-users'
    }) as JWTPayload;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.error('JWT', 'JWT refresh token verification failed', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extract access token from Authorization header or httpOnly cookie.
 */
export function extractAccessToken(req: AuthenticatedRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return extractTokenFromHeader(authHeader);
  }

  if (req.cookies && typeof req.cookies.accessToken === 'string') {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * JWT Authentication Middleware
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractAccessToken(req);

  if (!token) {
    logger.warn("JWT", "Missing access token", { url: req.originalUrl, method: req.method });
    return next(new AuthenticationError('Access token required'));
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    logger.warn("JWT", "Token verification failed", { url: req.originalUrl });
    return next(new AuthenticationError('Invalid or expired token'));
  }

  // Add user info to request
  req.user = {
    id: decoded.userId,
    email: decoded.email
  };

  setUserLogContext(req, decoded.userId);
  logger.debug("JWT", "Authenticated", { userId: decoded.userId, url: req.originalUrl });
  next();
}

/**
 * Optional JWT Authentication Middleware
 * Continues even if no valid token is provided; reads the Authorization header
 * or the httpOnly access-token cookie.
 */
export function optionalAuthenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractAccessToken(req);

  if (!token) {
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (decoded) {
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    setUserLogContext(req, decoded.userId);
  }

  next();
}

/**
 * Calculate the absolute expiry Date for a token given its `expiresIn` string.
 */
export function getTokenExpiryDate(expiresIn: string | number): Date {
  const now = Date.now();
  if (typeof expiresIn === 'number') {
    return new Date(now + expiresIn * 1000);
  }

  const match = String(expiresIn).match(/^((\d+)\s*)?(d|days?|h|hours?|m|minutes?|s|seconds?)$/i);
  if (match) {
    const value = parseInt(match[2] || '1', 10);
    const unit = match[3].toLowerCase();
    let ms = value * 1000;
    if (unit.startsWith('d')) ms *= 86400;
    else if (unit.startsWith('h')) ms *= 3600;
    else if (unit.startsWith('m')) ms *= 60;
    return new Date(now + ms);
  }

  // Fallback: assume seconds if numeric-looking
  const seconds = parseInt(String(expiresIn), 10);
  if (!isNaN(seconds)) {
    return new Date(now + seconds * 1000);
  }

  return new Date(now + 30 * 24 * 60 * 60 * 1000);
}

/**
 * Verify a refresh JWT and ensure it has not been revoked in the database.
 */
export async function verifyAndValidateRefreshToken(token: string): Promise<JWTPayload | null> {
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    return null;
  }

  const valid = await isRefreshTokenValid(token);
  if (!valid) {
    logger.warn('JWT', 'Refresh token has been revoked or expired in database');
    return null;
  }

  return decoded;
}

/**
 * Check if token is about to expire (within 24 hours)
 */
export function isTokenNearExpiry(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return timeUntilExpiry <= twentyFourHours;
  } catch (error) {
    return true;
  }
}