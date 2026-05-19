interface IReview {
  id: number;
  reviewer_id: number;
  business_id: number;
  product_id: number | null;
  order_id: number | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IReview;
