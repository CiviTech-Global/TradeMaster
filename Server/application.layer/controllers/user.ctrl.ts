import { Request, Response } from "express";
import { getAllUsersQuery } from "../../infrastructure.layer/utils/user.util";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsersQuery();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to get all users" });
  }
}
