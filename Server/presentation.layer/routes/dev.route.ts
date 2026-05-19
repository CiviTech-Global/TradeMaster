import express from "express";
import { seedDemoData } from "../../application.layer/controllers/dev.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = express.Router();

router.post("/seed", authenticateJWT, seedDemoData);

export default router;
