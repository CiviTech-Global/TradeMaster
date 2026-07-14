import express from "express";
import {
  getBusinessReviews,
  getProductReviews,
  // [DISABLED] Review CRUD not available in business directory mode
  // createReview,
  // updateReview,
  // deleteReview,
} from "../../application.layer/controllers/review.ctrl";
// [DISABLED] Review CRUD not available in business directory mode
// import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
// import { validate } from "../../infrastructure.layer/validation/middleware";
// import { createReviewSchema } from "../../infrastructure.layer/validation/schemas";

const router = express.Router();

// Public routes — read-only reviews are kept for business display
router.get("/business/:businessId", getBusinessReviews);
router.get("/product/:productId", getProductReviews);

// [DISABLED] Review CRUD not available in business directory mode
// router.post("/", authenticateJWT, validate(createReviewSchema), createReview);
// router.patch("/:id", authenticateJWT, updateReview);
// router.delete("/:id", authenticateJWT, deleteReview);

export default router;
