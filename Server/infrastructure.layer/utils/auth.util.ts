import { User } from "../../domain.layer/models/user";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Simple in-memory storage for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { userId: number; expires: number }>();

export async function getUserByEmailQuery(email: string, includePassword: boolean = false, userId?: number) {
  if (userId) {
    // Get user by ID
    const attributes = includePassword ? undefined : { exclude: ['password'] };
    return await User.findByPk(userId, { attributes });
  }

  // Get user by email
  const attributes = includePassword ? undefined : { exclude: ['password'] };
  return await User.findOne({
    where: { email },
    attributes
  });
}

export async function createPasswordResetTokenQuery(userId: number): Promise<string> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Set token to expire in 1 hour
  const expires = Date.now() + (60 * 60 * 1000);

  // Store token with user ID and expiration
  resetTokens.set(token, { userId, expires });

  // Clean up expired tokens (basic cleanup)
  const now = Date.now();
  for (const [key, value] of resetTokens.entries()) {
    if (value.expires < now) {
      resetTokens.delete(key);
    }
  }

  return token;
}

export async function verifyPasswordResetTokenQuery(token: string): Promise<number | null> {
  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    return null;
  }

  // Check if token has expired
  if (tokenData.expires < Date.now()) {
    resetTokens.delete(token);
    return null;
  }

  return tokenData.userId;
}

export async function resetUserPasswordQuery(userId: number, newPassword: string): Promise<boolean> {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });

    // Remove all reset tokens for this user
    for (const [key, value] of resetTokens.entries()) {
      if (value.userId === userId) {
        resetTokens.delete(key);
      }
    }

    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    return false;
  }
}