import { Request, Response } from "express";
import {
  getAllUsersQuery,
  getUserByIdQuery,
  createUserQuery,
  updateUserQuery,
  changePasswordQuery,
  deleteUserQuery,
  getUserByEmailQuery
} from "../../infrastructure.layer/utils/user.util";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsersQuery();
    res.json({ data: users, message: "Users retrieved successfully" });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to get all users" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await getUserByIdQuery(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: user, message: "User retrieved successfully" });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: firstname, lastname, email, password"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await getUserByEmailQuery(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const newUser = await createUserQuery({ firstname, lastname, email, password });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      data: userWithoutPassword,
      message: "User created successfully"
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { firstname, lastname, email } = req.body;

    if (!firstname && !lastname && !email) {
      return res.status(400).json({
        error: "At least one field (firstname, lastname, email) must be provided"
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingUser = await getUserByEmailQuery(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: "Email already in use by another user" });
      }
    }

    const updatedUser = await updateUserQuery(userId, { firstname, lastname, email });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: updatedUser, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Both currentPassword and newPassword are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long"
      });
    }

    const result = await changePasswordQuery(userId, currentPassword, newPassword);
    
    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }

    if (result === false) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deletedUser = await deleteUserQuery(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}
