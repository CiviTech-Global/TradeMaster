import { User } from "../../domain.layer/models/user";
import { Optional } from "sequelize";
import IUser from "../../domain.layer/interfaces/user";
import bcrypt from "bcrypt";

type UserCreationAttributes = Optional<IUser, "id" | "createdAt" | "updatedAt" | "deletedAt">;
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
    password: hashedPassword
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

  await user.destroy();
  return user;
}

export async function getUserByEmailQuery(email: string) {
  return await User.findOne({
    where: { email },
    attributes: { exclude: ['password'] }
  });
}
