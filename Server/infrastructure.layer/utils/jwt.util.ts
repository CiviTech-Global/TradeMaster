import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'trademaster_jwt_secret_key_dev_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'trademaster_refresh_secret_key_dev_only';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

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
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'trademaster',
    audience: 'trademaster-users'
  });
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
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'trademaster',
    audience: 'trademaster-users'
  });
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
    console.error('JWT verification failed:', error);
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
    console.error('JWT refresh token verification failed:', error);
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
 * JWT Authentication Middleware
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return res.status(401).json({
      error: 'Invalid authorization header format',
      code: 'INVALID_AUTH_HEADER'
    });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }

  // Add user info to request
  req.user = {
    id: decoded.userId,
    email: decoded.email
  };

  next();
}

/**
 * Optional JWT Authentication Middleware
 * Continues even if no token is provided
 */
export function optionalAuthenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (decoded) {
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
  }

  next();
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