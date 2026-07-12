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
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { validate } from "../../infrastructure.layer/validation/middleware";
import { createBusinessSchema, updateBusinessSchema } from "../../infrastructure.layer/validation/schemas";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllBusinesses);
router.get("/active", getActiveBusinesses);

// Protected routes (authentication required)
router.get("/:id", authenticateJWT, getBusinessById);
router.get("/owner/:ownerId", authenticateJWT, getBusinessesByOwner);
router.post("/", authenticateJWT, validate(createBusinessSchema), createBusiness);
router.patch("/:id", authenticateJWT, validate(updateBusinessSchema), updateBusiness);
router.delete("/:id", authenticateJWT, deleteBusiness);

export default router;
