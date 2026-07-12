import express from "express";
import {
  signin,
  signup,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken
} from "../../application.layer/controllers/auth.ctrl";
import { validate } from "../../infrastructure.layer/validation/middleware";
import {
  signinSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../infrastructure.layer/validation/schemas";

const router = express.Router();

router.post("/signin", validate(signinSchema), signin);
router.post("/signup", validate(signupSchema), signup);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/verify-token", verifyToken);

export default router;
