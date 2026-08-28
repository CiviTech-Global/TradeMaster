import { User } from "../../domain.layer/models/user";
import { Optional } from "sequelize";
import IUser from "../../domain.layer/interfaces/user";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

type UserCreationAttributes = Optional<IUser, "id" | "createdAt" | "updatedAt" | "deletedAt" | "avatar" | "phone" | "bio" | "default_latitude" | "default_longitude" | "consent_given" | "consent_given_at" | "privacy_policy_version" | "terms_version">;
type UserUpdateAttributes = Partial<Omit<IUser, "id" | "createdAt" | "updatedAt" | "deletedAt">>;

export async function getAllUsersQuery() {
  return await User.findAll({
    attributes: { exclude: ['password'] }
  });
}

export async function getUserByIdQuery(id: number) {
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
}

export async function createUserQuery(userData: UserCreationAttributes) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  return await User.create({
    ...userData,
    password: hashedPassword,
    consent_given: userData.consent_given ?? false,
    consent_given_at: userData.consent_given ? (userData.consent_given_at ?? new Date()) : null,
    privacy_policy_version: userData.privacy_policy_version ?? null,
    terms_version: userData.terms_version ?? null,
  });
}

export async function updateUserQuery(id: number, userData: UserUpdateAttributes) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  if (userData.password) {
    const saltRounds = 10;
    userData.password = await bcrypt.hash(userData.password, saltRounds);
  }

  await user.update(userData);
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
}

export async function changePasswordQuery(id: number, currentPassword: string, newPassword: string) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return false;
  }

  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  
  await user.update({ password: hashedNewPassword });
  return true;
}

export async function deleteUserQuery(id: number) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  // Anonymize PII before soft-delete so the retained record cannot identify the individual.
  const deletedEmail = `deleted.${id}.${Date.now()}@trademaster.local`;
  await user.update({
    firstname: "Deleted",
    lastname: "User",
    email: deletedEmail,
    password: await bcrypt.hash(crypto.randomUUID(), 10),
    avatar: null,
    phone: null,
    bio: null,
    default_latitude: null,
    default_longitude: null,
    consent_given: false,
    consent_given_at: null,
    privacy_policy_version: null,
    terms_version: null,
  });

  // Remove avatar file if it was stored locally
  if (user.avatar) {
    try {
      const avatarPath = path.join(process.cwd(), env.UPLOAD_DIR, user.avatar.replace(/^\/uploads\//, ''));
      await fs.unlink(avatarPath);
    } catch {
      // Ignore cleanup errors; the file may not exist or path may be external.
    }
  }

  await user.destroy();
  return user;
}

export async function getUserByEmailQuery(email: string) {
  return await User.findOne({
    where: { email },
    attributes: { exclude: ['password'] }
  });
}
