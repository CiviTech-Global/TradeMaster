import { z } from "zod";

export const signupSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(100),
  lastname: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const createBusinessSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  address: z.string().min(1, "Address is required"),
  emails: z.array(z.string().email("Invalid email format")).min(1, "At least one email is required"),
  phones: z.array(z.string().regex(/^\+?[1-9]\d{0,15}$/, "Invalid phone format")).min(1, "At least one phone is required"),
  is_active: z.boolean().optional().default(true),
  logo: z.string().max(500).optional(),
  description: z.string().optional(),
  category_id: z.number().int().positive().optional(),
  cover_image: z.string().max(500).optional(),
});

export const updateBusinessSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  address: z.string().min(1).optional(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().regex(/^\+?[1-9]\d{0,15}$/)).optional(),
  is_active: z.boolean().optional(),
  logo: z.string().max(500).optional(),
  description: z.string().optional(),
  category_id: z.number().int().positive().nullable().optional(),
  cover_image: z.string().max(500).nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export const createProductSchema = z.object({
  business_id: z.number().int().positive(),
  category_id: z.number().int().positive().nullable().optional(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().length(3).optional().default("USD"),
  stock_quantity: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  category_id: z.number().int().positive().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export const createOrderSchema = z.object({
  business_id: z.number().int().positive(),
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    variant_id: z.number().int().positive().nullable().optional(),
    quantity: z.number().int().min(1),
  })).min(1, "At least one item is required"),
  shipping_address: z.string().optional(),
  shipping_latitude: z.number().min(-90).max(90).nullable().optional(),
  shipping_longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().optional(),
  currency: z.string().length(3).optional(),
});

export const sendMessageSchema = z.object({
  receiver_id: z.number().int().positive(),
  content: z.string().min(1, "Message content is required").max(5000),
  order_id: z.number().int().positive().nullable().optional(),
  product_id: z.number().int().positive().nullable().optional(),
});

export const createReviewSchema = z.object({
  business_id: z.number().int().positive(),
  product_id: z.number().int().positive().nullable().optional(),
  order_id: z.number().int().positive().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["confirmed", "in_transit", "delivered", "cancelled"]),
  reason: z.string().max(500).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  type: z.enum(["all", "products", "businesses"]).optional().default("all"),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().min(0.1).max(100).optional(),
  category_id: z.coerce.number().int().positive().optional(),
});
