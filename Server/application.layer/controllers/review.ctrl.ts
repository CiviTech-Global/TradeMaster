import { Request, Response } from "express";
import {
  getBusinessReviewsQuery,
  getProductReviewsQuery,
  createReviewQuery,
  updateReviewQuery,
  deleteReviewQuery,
  getReviewByIdQuery,
  getBusinessAverageRating,
  checkExistingReview,
  verifyOrderDelivered,
} from "../../infrastructure.layer/utils/review.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";

export async function getBusinessReviews(req: Request, res: Response) {
  try {
    const businessId = parseInt(req.params.businessId, 10);
    if (isNaN(businessId)) return res.status(400).json({ error: "Invalid business ID" });

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await getBusinessReviewsQuery(businessId, page, limit);
    const stats = await getBusinessAverageRating(businessId);

    res.json({ ...result, stats, message: "Reviews retrieved successfully" });
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
}

export async function getProductReviews(req: Request, res: Response) {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await getProductReviewsQuery(productId, page, limit);
    res.json({ ...result, message: "Reviews retrieved successfully" });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
}

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { business_id, product_id, order_id, rating, comment } = req.body;

    if (!business_id || !rating) {
      return res.status(400).json({ error: "business_id and rating are required" });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    // If order_id provided, verify the order is delivered and belongs to buyer
    if (order_id) {
      const isDelivered = await verifyOrderDelivered(order_id, userId);
      if (!isDelivered) {
        return res.status(400).json({ error: "You can only review delivered orders" });
      }

      // Check for duplicate review
      const existing = await checkExistingReview(userId, order_id);
      if (existing) {
        return res.status(400).json({ error: "You have already reviewed this order" });
      }
    }

    const review = await createReviewQuery({
      reviewer_id: userId,
      business_id,
      product_id: product_id || undefined,
      order_id: order_id || undefined,
      rating,
      comment: comment || undefined,
    });

    res.status(201).json({ data: review, message: "Review created successfully" });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid review ID" });

    const review = await getReviewByIdQuery(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.reviewer_id !== req.user!.id) {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    const updated = await updateReviewQuery(id, { rating, comment });
    res.json({ data: updated, message: "Review updated successfully" });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid review ID" });

    const review = await getReviewByIdQuery(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.reviewer_id !== req.user!.id) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    await deleteReviewQuery(id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
}
