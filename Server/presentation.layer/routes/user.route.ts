import express from "express";
import {
  getUserById,
  updateUser,
  changePassword,
  deleteUser
} from "../../application.layer/controllers/user.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { requireOwnership } from "../../infrastructure.layer/middleware/authorization.middleware";

const router = express.Router();

// All user routes require authentication. Users may only access/modify their own account.
router.get("/:id", authenticateJWT, requireOwnership(), getUserById);
router.patch("/:id", authenticateJWT, requireOwnership(), updateUser);
router.patch("/change-password/:id", authenticateJWT, requireOwnership(), changePassword);
router.delete("/:id", authenticateJWT, requireOwnership(), deleteUser);

export default router;
