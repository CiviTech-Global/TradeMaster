import express from "express";
import {
  signin,
  signup,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken,
  signout
} from "../../application.layer/controllers/auth.ctrl";
import { optionalAuthenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
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
// Signout is intentionally tolerant: it must clear cookies even when the access
// token is missing/expired, otherwise a stale session could silently restore itself.
router.post("/signout", optionalAuthenticateJWT, signout);

export default router;
