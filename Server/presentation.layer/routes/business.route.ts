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

const router = express.Router();

router.get("/", getAllBusinesses);
router.get("/active", getActiveBusinesses);
router.get("/:id", getBusinessById);
router.get("/owner/:ownerId", getBusinessesByOwner);
router.post("/", createBusiness);
router.patch("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;