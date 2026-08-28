import crypto from 'crypto';
import { RefreshToken } from '../../domain.layer/models/refresh-token';

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  await RefreshToken.create({
    user_id: userId,
    token_hash: hashRefreshToken(token),
    expires_at: expiresAt,
    revoked: false,
  });
}

export async function findRefreshToken(token: string): Promise<RefreshToken | null> {
  return await RefreshToken.findOne({
    where: { token_hash: hashRefreshToken(token) }
  });
}

export async function revokeRefreshToken(token: string, replacedBy?: string): Promise<void> {
  const record = await findRefreshToken(token);
  if (record) {
    await record.update({
      revoked: true,
      replaced_by_token_hash: replacedBy ? hashRefreshToken(replacedBy) : null,
    });
  }
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  await RefreshToken.update(
    { revoked: true },
    { where: { user_id: userId } }
  );
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const record = await findRefreshToken(token);
  if (!record) return false;
  if (record.revoked) return false;
  if (record.expires_at < new Date()) return false;
  return true;
}
