import { Request, Response } from "express";
import {
  getUserByEmailQuery,
  createPasswordResetTokenQuery,
  verifyPasswordResetTokenQuery,
  resetUserPasswordQuery
} from "../../infrastructure.layer/utils/auth.util";
import { createUser } from "./user.ctrl";
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  AuthenticatedRequest
} from "../../infrastructure.layer/utils/jwt.util";
import bcrypt from "bcrypt";

export async function signin(req: Request, res: Response) {
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
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    // Generate JWT tokens
    const tokens = generateTokens(user.id, user.email);

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
    console.error("Error during signin:", error);
    res.status(500).json({ error: "Signin failed" });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    // Use the existing createUser function but return JWT tokens
    await createUser(req, res);

    // If user creation was successful, the response will have been sent
    // Check if response was successful and get the user data to generate tokens
    if (res.headersSent) {
      return;
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Signup failed" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
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

    // In a real application, send email with reset link here
    console.log(`Password reset link: /set-new-password?token=${resetToken}`);

    res.json({
      message: "Password reset link has been sent to your email"
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long"
      });
    }

    // Verify reset token and get user ID
    const userId = await verifyPasswordResetTokenQuery(token);
    if (!userId) {
      return res.status(400).json({
        error: "Invalid or expired reset token"
      });
    }

    // Reset password
    await resetUserPasswordQuery(userId, newPassword);

    res.json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
        code: "TOKEN_MISSING"
      });
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return res.status(401).json({
        error: "Invalid authorization header format",
        code: "INVALID_AUTH_HEADER"
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
    console.error("Error during token verification:", error);
    res.status(500).json({ error: "Token verification failed" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required",
        code: "REFRESH_TOKEN_MISSING"
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
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

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);
    const { password: _, ...userWithoutPassword } = user.toJSON();

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
    console.error("Error during token refresh:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
}