import express from "express";
import {
  signin,
  signup,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken
} from "../../application.layer/controllers/auth.ctrl";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-token", verifyToken);

export default router;