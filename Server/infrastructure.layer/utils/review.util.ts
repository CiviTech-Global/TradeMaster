import { Review } from "../../domain.layer/models/review";
import { User } from "../../domain.layer/models/user";
import { Business } from "../../domain.layer/models/business";
import { Order } from "../../domain.layer/models/order";
import { fn, col } from "sequelize";

const reviewIncludes = [
  {
    model: User,
    as: 'reviewer',
    attributes: ['id', 'firstname', 'lastname', 'avatar'],
  },
];

export async function getBusinessReviewsQuery(businessId: number, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { rows, count } = await Review.findAndCountAll({
    where: { business_id: businessId },
    include: reviewIncludes,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getProductReviewsQuery(productId: number, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { rows, count } = await Review.findAndCountAll({
    where: { product_id: productId },
    include: reviewIncludes,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function createReviewQuery(data: {
  reviewer_id: number;
  business_id: number;
  product_id?: number;
  order_id?: number;
  rating: number;
  comment?: string;
}) {
  const review = await Review.create({
    reviewer_id: data.reviewer_id,
    business_id: data.business_id,
    product_id: data.product_id || null,
    order_id: data.order_id || null,
    rating: data.rating,
    comment: data.comment || null,
  });

  return await Review.findByPk(review.id, { include: reviewIncludes });
}

export async function updateReviewQuery(id: number, data: { rating?: number; comment?: string }) {
  const review = await Review.findByPk(id);
  if (!review) return null;

  const updateData: any = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.comment !== undefined) updateData.comment = data.comment;

  await review.update(updateData);
  return await Review.findByPk(id, { include: reviewIncludes });
}

export async function deleteReviewQuery(id: number) {
  const review = await Review.findByPk(id);
  if (!review) return null;
  await review.destroy();
  return review;
}

export async function getReviewByIdQuery(id: number) {
  return await Review.findByPk(id, { include: reviewIncludes });
}

export async function getBusinessAverageRating(businessId: number) {
  const result = await Review.findOne({
    where: { business_id: businessId },
    attributes: [
      [fn('AVG', col('rating')), 'avgRating'],
      [fn('COUNT', col('id')), 'reviewCount'],
    ],
    raw: true,
  }) as any;

  return {
    averageRating: result?.avgRating ? parseFloat(result.avgRating).toFixed(1) : null,
    reviewCount: parseInt(result?.reviewCount || '0', 10),
  };
}

export async function checkExistingReview(reviewerId: number, orderId: number) {
  return await Review.findOne({
    where: { reviewer_id: reviewerId, order_id: orderId },
  });
}

export async function verifyOrderDelivered(orderId: number, buyerId: number): Promise<boolean> {
  const order = await Order.findOne({
    where: { id: orderId, buyer_id: buyerId, status: 'delivered' },
  });
  return !!order;
}
