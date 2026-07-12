# TradeMaster — API Reference

Base URL: `http://localhost:3000`

Interactive documentation: `http://localhost:3000/api-docs` (non-production only)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `/auth/signin` or `/auth/signup`.

---

## Auth Endpoints

### POST `/auth/signup`
Create a new user account.

**Request:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "securepass"
}
```

**Response (201):**
```json
{
  "data": {
    "user": { "id": 1, "firstname": "John", "lastname": "Doe", "email": "john@example.com" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": "7d"
  },
  "message": "Signup successful"
}
```

### POST `/auth/signin`
Authenticate with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass"
}
```

**Response (200):** Same structure as signup.

### POST `/auth/refresh-token`
Get new token pair from a refresh token.

**Request:**
```json
{ "refreshToken": "eyJhbG..." }
```

### POST `/auth/forgot-password`
Send a password reset request. In development, the reset link is logged to the console.

### POST `/auth/reset-password`
Reset password using a valid token.

**Request:**
```json
{ "token": "abc123...", "newPassword": "newsecurepass" }
```

### GET `/auth/verify-token`
Verify the current access token is valid. Returns user data.

---

## User Endpoints

### GET `/users/`
List all users.

### GET `/users/:id`
Get user by ID.

### POST `/users/`
Create a user (used internally).

### PATCH `/users/:id`
Update user profile (firstname, lastname, email).

### PATCH `/users/change-password/:id`
Change password. Requires current password verification.

**Request:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### DELETE `/users/:id`
Soft-delete a user.

---

## Business Endpoints

### GET `/businesses/`
List all businesses with owner and category info.

### GET `/businesses/active`
List only active businesses (`is_active = true`).

### GET `/businesses/:id` 🔒
Get business by ID with full details.

### GET `/businesses/owner/:ownerId` 🔒
Get all businesses owned by a specific user.

### POST `/businesses/` 🔒
Create a new business.

**Request:**
```json
{
  "owner": 1,
  "title": "Alice's Clay Corner",
  "longitude": -73.935242,
  "latitude": 40.73061,
  "address": "123 Main St, New York, NY",
  "emails": ["alice@shop.com"],
  "phones": ["+1234567890"],
  "description": "Handcrafted ceramics",
  "category_id": 1,
  "is_active": true
}
```

### PATCH `/businesses/:id` 🔒
Update a business. All fields optional; at least one required.

### DELETE `/businesses/:id` 🔒
Soft-delete a business.

---

## Product Endpoints

### GET `/products/`
List products with filters.

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `business_id` | number | Filter by business |
| `category_id` | number | Filter by category |
| `min_price` | number | Minimum price |
| `max_price` | number | Maximum price |
| `search` | string | Text search in title/description |
| `lat` | number | Latitude for location search |
| `lng` | number | Longitude for location search |
| `radius_km` | number | Radius in km (default: 10) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `sort_by` | string | Sort field |

### GET `/products/nearby`
Find products within a radius using Haversine formula.

**Query parameters:** `lat`, `lng`, `radius_km` (default: 10), `limit` (default: 20)

### GET `/products/business/:businessId`
Get all products for a specific business.

### GET `/products/:id`
Get product with images, variants, business, and category.

### GET `/products/:id/variants`
Get all variants for a product.

### POST `/products/` 🔒
Create a product (must own the business).

**Request:**
```json
{
  "business_id": 1,
  "title": "Ceramic Mug",
  "price": 24.99,
  "description": "Handmade ceramic mug",
  "category_id": 2,
  "currency": "USD",
  "stock_quantity": 15
}
```

### PATCH `/products/:id` 🔒
Update a product (owner only).

### DELETE `/products/:id` 🔒
Delete a product (owner only).

### POST `/products/:id/images` 🔒
Upload images for a product (max 5 files, 5MB each).

Accepts `multipart/form-data` with field name `images`.

### DELETE `/products/:id/images/:imageId` 🔒
Delete a product image.

### PATCH `/products/:id/images/:imageId` 🔒
Update image metadata (sort_order, is_primary, alt_text).

### POST `/products/:id/variants` 🔒
Create a product variant.

**Request:**
```json
{
  "name": "Color",
  "value": "Blue",
  "price_modifier": 2.00,
  "stock_quantity": 10,
  "sku": "MUG-BLU-001"
}
```

### PATCH `/products/:id/variants/:variantId` 🔒
Update a variant.

### DELETE `/products/:id/variants/:variantId` 🔒
Delete a variant.

---

## Order Endpoints

### GET `/orders/` 🔒
Get orders for the authenticated user (as buyer).

**Query parameters:** `status`, `page`, `limit`

### POST `/orders/` 🔒
Create a new order.

**Request:**
```json
{
  "business_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "variant_id": 5, "quantity": 1 }
  ],
  "shipping_address": "456 Oak Ave, City, ST",
  "shipping_latitude": 40.7128,
  "shipping_longitude": -74.0060,
  "notes": "Please leave at door"
}
```

Stock is validated and decremented atomically. Order number format: `TM-YYYYMMDD-NNNN`.

### GET `/orders/business/:businessId` 🔒
Get orders for a specific business (owner only).

### GET `/orders/:id` 🔒
Get order detail (buyer or business owner).

### PATCH `/orders/:id/status` 🔒
Update order status.

**Request:**
```json
{
  "status": "confirmed",
  "reason": "Optional reason for cancellation"
}
```

**Status transitions:**
- Buyer can only: `pending` → `cancelled`
- Seller can: `pending` → `confirmed` → `in_transit` → `delivered`, or cancel at any stage
- Cancelling restores stock quantities

---

## Message Endpoints

### GET `/messages/conversations` 🔒
List all conversation partners with last message and unread count.

### GET `/messages/unread-count` 🔒
Get total unread message count.

### GET `/messages/conversation/:userId` 🔒
Get paginated message thread. Auto-marks messages from partner as read.

**Query parameters:** `order_id`, `product_id`, `page`, `limit`

### POST `/messages/` 🔒
Send a message. Also broadcasts via WebSocket.

**Request:**
```json
{
  "receiver_id": 2,
  "content": "Is this item still available?",
  "order_id": null,
  "product_id": 5
}
```

### PATCH `/messages/:id/read` 🔒
Mark a single message as read.

---

## Review Endpoints

### GET `/reviews/business/:businessId`
Get paginated reviews for a business with average rating stats.

**Query parameters:** `page`, `limit` (default: 20)

### GET `/reviews/product/:productId`
Get paginated reviews for a product.

### POST `/reviews/` 🔒
Create a review. Must have a delivered order to review (if `order_id` provided). Prevents duplicate reviews per order.

**Request:**
```json
{
  "business_id": 1,
  "product_id": 5,
  "order_id": 10,
  "rating": 5,
  "comment": "Great quality, fast shipping!"
}
```

### PATCH `/reviews/:id` 🔒
Update a review (owner only). Rating must be 1-5 integer.

### DELETE `/reviews/:id` 🔒
Delete a review (owner only).

---

## Category Endpoints

### GET `/categories/`
List all categories. Supports `?parent_id=` filter.

### GET `/categories/:id`
Get category with children and parent.

### POST `/categories/` 🔒
Create a category. Slug is auto-generated from name.

### PATCH `/categories/:id` 🔒
Update a category.

### DELETE `/categories/:id` 🔒
Delete a category.

---

## Upload Endpoints

### POST `/uploads/` 🔒
Upload a single file. Accepts JPEG, PNG, WebP, GIF up to 5MB.

### POST `/uploads/multiple` 🔒
Upload multiple files (max 5).

### DELETE `/uploads/:id` 🔒
Delete an upload record and file from disk.

### PATCH `/uploads/users/:id/avatar` 🔒
Update user avatar. Deletes the old avatar file.

### GET `/uploads/users/:id/public`
Get public user profile (no auth required).

---

## Search

### GET `/search/`
Unified search across products and businesses.

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | `all`, `products`, or `businesses` (default: `all`) |
| `lat` | number | Latitude for location-based results |
| `lng` | number | Longitude for location-based results |
| `radius_km` | number | Search radius in km |
| `category_id` | number | Filter by category |

---

## Dev Endpoints (non-production only)

### POST `/dev/seed`
Seed demo data: 6 categories, 3 businesses, 9 products, 2 orders, 2 reviews, 3 messages. Requires authentication.

---

## WebSocket Events

Connect to `ws://localhost:3000` with authentication:

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-access-token' }
});
```

### Client → Server Events
| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `partnerId: number` | Join a conversation room |
| `leave_conversation` | `partnerId: number` | Leave a conversation room |
| `send_message` | `{ receiverId, content, orderId?, productId? }` | Send a message (also save via HTTP) |
| `typing_start` | `partnerId: number` | Start typing indicator |
| `typing_stop` | `partnerId: number` | Stop typing indicator |
| `mark_read` | `partnerId: number` | Mark conversation as read |

### Server → Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ id, senderId, receiverId, content, createdAt }` | New message in conversation |
| `message_notification` | `{ senderId, messageId, content }` | Notification for other tabs/devices |
| `user_typing` | `{ userId }` | Partner started typing |
| `user_stop_typing` | `{ userId }` | Partner stopped typing |
| `messages_read` | `{ userId }` | Messages marked as read |

---

## Common Response Format

**Success:**
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

**Paginated:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "message": "Retrieved successfully"
}
```

**Error:**
```json
{
  "error": "Description of what went wrong"
}
```

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

## Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| General API | 200 requests | 15 minutes |
| Auth endpoints | 20 requests | 15 minutes |
