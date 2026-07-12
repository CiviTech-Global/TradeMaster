import express from "express";
import {
  getBusinessReviews,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../application.layer/controllers/review.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { validate } from "../../infrastructure.layer/validation/middleware";
import { createReviewSchema } from "../../infrastructure.layer/validation/schemas";

const router = express.Router();

// Public routes
router.get("/business/:businessId", getBusinessReviews);
router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/", authenticateJWT, validate(createReviewSchema), createReview);
router.patch("/:id", authenticateJWT, updateReview);
router.delete("/:id", authenticateJWT, deleteReview);

export default router;
