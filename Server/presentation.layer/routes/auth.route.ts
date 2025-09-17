import express from "express";
import {
  signin,
  forgotPassword,
  resetPassword,
  verifyToken
} from "../../application.layer/controllers/auth.ctrl";

const router = express.Router();

router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-token", verifyToken);

export default router;