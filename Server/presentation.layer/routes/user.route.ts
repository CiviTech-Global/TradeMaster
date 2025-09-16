import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser
} from "../../application.layer/controllers/user.ctrl";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.patch("/change-password/:id", changePassword);
router.delete("/:id", deleteUser);

export default router;
