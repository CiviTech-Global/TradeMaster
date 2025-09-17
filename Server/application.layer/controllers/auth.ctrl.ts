import { Request, Response } from "express";
import {
  getUserByEmailQuery,
  createPasswordResetTokenQuery,
  verifyPasswordResetTokenQuery,
  resetUserPasswordQuery
} from "../../infrastructure.layer/utils/auth.util";
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

    // In a real application, generate JWT token here
    const token = `temp_token_${user.id}_${Date.now()}`;

    res.json({
      data: {
        user: userWithoutPassword,
        token: token
      },
      message: "Signin successful"
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ error: "Signin failed" });
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    // In a real application, verify JWT token here
    // For now, just check if token follows our temporary format
    if (!token.startsWith('temp_token_')) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const tokenParts = token.split('_');
    if (tokenParts.length !== 4) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const userId = parseInt(tokenParts[2], 10);
    if (isNaN(userId)) {
      return res.status(401).json({ error: "Invalid user ID in token" });
    }

    // Get user by ID to verify token is still valid
    const user = await getUserByEmailQuery('', false, userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      data: {
        user: userWithoutPassword,
        valid: true
      },
      message: "Token is valid"
    });
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(500).json({ error: "Token verification failed" });
  }
}