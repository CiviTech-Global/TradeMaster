import express from "express";
import {
  getAllBusinesses,
  getBusinessById,
  getBusinessesByOwner,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getActiveBusinesses
} from "../../application.layer/controllers/business.ctrl";
import { authenticateJWT, optionalAuthenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllBusinesses);
router.get("/active", getActiveBusinesses);

// Protected routes (authentication required)
router.get("/:id", authenticateJWT, getBusinessById);
router.get("/owner/:ownerId", authenticateJWT, getBusinessesByOwner);
router.post("/", authenticateJWT, createBusiness);
router.patch("/:id", authenticateJWT, updateBusiness);
router.delete("/:id", authenticateJWT, deleteBusiness);

export default router;