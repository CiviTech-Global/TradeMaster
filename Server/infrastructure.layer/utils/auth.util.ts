import { User } from "../../domain.layer/models/user";
import { PasswordResetToken } from "../../domain.layer/models/password-reset-token";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function getUserByEmailQuery(email: string, includePassword: boolean = false, userId?: number) {
  if (userId) {
    const attributes = includePassword ? undefined : { exclude: ['password'] };
    return await User.findByPk(userId, { attributes });
  }

  const attributes = includePassword ? undefined : { exclude: ['password'] };
  return await User.findOne({
    where: { email },
    attributes
  });
}

export async function createPasswordResetTokenQuery(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour

  // Invalidate any existing tokens for this user
  await PasswordResetToken.update(
    { used: true },
    { where: { user_id: userId, used: false } }
  );

  // Create new token in database
  await PasswordResetToken.create({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  return token;
}

export async function verifyPasswordResetTokenQuery(token: string): Promise<number | null> {
  const tokenRecord = await PasswordResetToken.findOne({
    where: { token, used: false },
  });

  if (!tokenRecord) {
    return null;
  }

  // Check if token has expired
  if (new Date() > tokenRecord.expires_at) {
    await tokenRecord.update({ used: true });
    return null;
  }

  return tokenRecord.user_id;
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

    // Mark all reset tokens for this user as used
    await PasswordResetToken.update(
      { used: true },
      { where: { user_id: userId } }
    );

    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    return false;
  }
}
