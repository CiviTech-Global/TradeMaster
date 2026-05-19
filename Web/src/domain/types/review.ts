export interface ReviewUser {
  id: number;
  firstname: string;
  lastname: string;
}

export interface Review {
  id: number;
  reviewer_id: number;
  business_id: number;
  product_id: number | null;
  order_id: number | null;
  rating: number;
  comment: string | null;
  reviewer: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface ReviewListResponse {
  data: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: ReviewStats;
  message: string;
}

export interface ReviewResponse {
  data: Review;
  message: string;
}
