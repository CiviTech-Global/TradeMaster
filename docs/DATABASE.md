# TradeMaster — Database Schema

PostgreSQL 16 with Sequelize ORM (TypeScript decorators). All tables use `timestamps: true` and `paranoid: true` (soft deletes via `deletedAt`) except `messages`.

## Schema Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users      │────→│  businesses  │────→│   products   │
│              │     │              │     │              │
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ firstname    │     │ owner (FK)   │     │ business_id  │
│ lastname     │     │ title        │     │ category_id  │
│ email (UQ)   │     │ latitude     │     │ title        │
│ password     │     │ longitude    │     │ price        │
│ avatar       │     │ address      │     │ stock_qty    │
│ phone        │     │ emails[]     │     │ currency     │
│ bio          │     │ phones[]     │     └──────┬───────┘
│ default_lat  │     │ is_active    │            │
│ default_lng  │     │ logo         │     ┌──────┴───────┐
└──────┬───────┘     │ description  │     │              │
       │             │ category_id  │     ▼              ▼
       │             │ cover_image  │ ┌────────┐  ┌────────────┐
       │             └──────────────┘ │ images │  │  variants  │
       │                              └────────┘  └────────────┘
       │
       ├────────────→ ┌───────────┐
       │               │  orders   │
       │               │          │
       │               │ id (PK)  │────→ ┌─────────────┐
       │               │ order_no │      │ order_items  │
       │               │ buyer_id │      │             │
       │               │ biz_id   │      │ order_id(FK)│
       │               │ status   │      │ product_id  │
       │               │ total    │      │ variant_id  │
       │               └──────────┘      │ quantity    │
       │                                 │ unit_price  │
       ├────────────→ ┌───────────┐      │ total_price │
       │               │ messages  │      └─────────────┘
       │               │          │
       │               │ sender_id│
       │               │ receiver │
       │               │ content  │
       │               │ is_read  │
       │               └──────────┘
       │
       ├────────────→ ┌───────────┐
       │               │  reviews  │
       │               │          │
       │               │ reviewer  │
       │               │ biz_id   │
       │               │ prod_id  │
       │               │ order_id │
       │               │ rating   │
       │               │ comment  │
       │               └──────────┘
       │
       ├────────────→ ┌──────────────┐
       │               │   uploads    │
       │               │              │
       │               │ uploader_id  │
       │               │ filename     │
       │               │ url          │
       │               └──────────────┘
       │
       └────────────→ ┌──────────────────┐
                       │password_reset_   │
                       │    tokens        │
                       │                  │
                       │ user_id (FK)     │
                       │ token (unique)   │
                       │ expires_at       │
                       │ used             │
                       └──────────────────┘
```

## Tables

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | User identifier |
| firstname | VARCHAR(100) | NOT NULL | First name |
| lastname | VARCHAR(100) | NOT NULL | Last name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| password | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| avatar | VARCHAR(500) | NULLABLE | Avatar image URL |
| phone | VARCHAR(20) | NULLABLE | Phone number |
| bio | TEXT | NULLABLE | Short biography |
| default_latitude | DECIMAL(11,8) | NULLABLE | Default location latitude |
| default_longitude | DECIMAL(10,8) | NULLABLE | Default location longitude |
| createdAt | DATE | NOT NULL | Record creation time |
| updatedAt | DATE | NOT NULL | Last update time |
| deletedAt | DATE | NULLABLE | Soft delete time |

**Indexes:** `email` (unique)

### businesses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Business identifier |
| owner | INTEGER | FK → users.id, NOT NULL | Owner user ID |
| title | VARCHAR(255) | NOT NULL | Business name |
| longitude | DECIMAL(10,8) | NOT NULL | GPS longitude |
| latitude | DECIMAL(11,8) | NOT NULL | GPS latitude |
| address | TEXT | NOT NULL | Physical address |
| emails | VARCHAR[] | NOT NULL, DEFAULT '{}' | Contact emails (PostgreSQL array) |
| phones | VARCHAR[] | NOT NULL, DEFAULT '{}' | Contact phones (PostgreSQL array) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Whether business is active |
| logo | VARCHAR(500) | NULLABLE | Logo image URL |
| description | TEXT | NULLABLE | Business description |
| category_id | INTEGER | FK → categories.id, NULLABLE | Business category |
| cover_image | VARCHAR(500) | NULLABLE | Cover image URL |
| createdAt | DATE | NOT NULL | Record creation time |
| updatedAt | DATE | NOT NULL | Last update time |
| deletedAt | DATE | NULLABLE | Soft delete time |

**Indexes:** `owner`, `is_active`, `category_id`

### categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Category identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| slug | VARCHAR(120) | NOT NULL, UNIQUE | URL-friendly identifier |
| description | TEXT | NULLABLE | Category description |
| parent_id | INTEGER | FK → categories.id, NULLABLE | Parent category (hierarchical) |
| icon | VARCHAR(255) | NULLABLE | Icon identifier |
| sort_order | INTEGER | DEFAULT 0 | Display ordering |
| is_active | BOOLEAN | DEFAULT true | Whether category is active |
| createdAt/updatedAt/deletedAt | DATE | | Timestamps |

**Indexes:** `slug` (unique), `parent_id`, `is_active`

### products

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Product identifier |
| business_id | INTEGER | FK → businesses.id, NOT NULL | Parent business |
| category_id | INTEGER | FK → categories.id, NULLABLE | Product category |
| title | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | NULLABLE | Product description |
| price | DECIMAL(12,2) | NOT NULL | Price |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code (ISO 4217) |
| stock_quantity | INTEGER | DEFAULT 0 | Available stock |
| is_active | BOOLEAN | DEFAULT true | Whether product is listed |
| createdAt/updatedAt/deletedAt | DATE | | Timestamps |

**Indexes:** `business_id`, `category_id`, `is_active`, `price`

### product_images

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Image identifier |
| product_id | INTEGER | FK → products.id, NOT NULL | Parent product |
| url | VARCHAR(500) | NOT NULL | Image file path |
| alt_text | VARCHAR(255) | NULLABLE | Alternative text |
| sort_order | INTEGER | DEFAULT 0 | Display ordering |
| is_primary | BOOLEAN | DEFAULT false | Primary display image |
| createdAt/updatedAt | DATE | | Timestamps |

**Indexes:** `product_id`

### product_variants

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Variant identifier |
| product_id | INTEGER | FK → products.id, NOT NULL | Parent product |
| name | VARCHAR(100) | NOT NULL | Variant type (e.g., "Color") |
| value | VARCHAR(100) | NOT NULL | Variant value (e.g., "Blue") |
| price_modifier | DECIMAL(12,2) | DEFAULT 0 | Price adjustment from base |
| stock_quantity | INTEGER | NULLABLE | Variant-specific stock |
| sku | VARCHAR(50) | NULLABLE | Stock keeping unit code |
| is_active | BOOLEAN | DEFAULT true | Whether variant is available |
| createdAt/updatedAt | DATE | | Timestamps |

**Indexes:** `product_id`

### orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Order identifier |
| order_number | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable order ID (TM-YYYYMMDD-NNNN) |
| buyer_id | INTEGER | FK → users.id, NOT NULL | Purchasing user |
| business_id | INTEGER | FK → businesses.id, NOT NULL | Seller business |
| status | VARCHAR(20) | DEFAULT 'pending' | Order status |
| total_amount | DECIMAL(12,2) | NOT NULL | Total order value |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| shipping_address | TEXT | NULLABLE | Delivery address |
| shipping_latitude | DECIMAL(11,8) | NULLABLE | Delivery latitude |
| shipping_longitude | DECIMAL(10,8) | NULLABLE | Delivery longitude |
| notes | TEXT | NULLABLE | Buyer notes |
| cancelled_reason | TEXT | NULLABLE | Cancellation reason |
| confirmed_at | DATE | NULLABLE | Confirmation timestamp |
| shipped_at | DATE | NULLABLE | Shipment timestamp |
| delivered_at | DATE | NULLABLE | Delivery timestamp |
| cancelled_at | DATE | NULLABLE | Cancellation timestamp |
| createdAt/updatedAt/deletedAt | DATE | | Timestamps |

**Indexes:** `buyer_id`, `business_id`, `status`, `order_number` (unique)

**Status values:** `pending`, `confirmed`, `in_transit`, `delivered`, `cancelled`

### order_items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Item identifier |
| order_id | INTEGER | FK → orders.id, NOT NULL | Parent order |
| product_id | INTEGER | FK → products.id, NOT NULL | Ordered product |
| variant_id | INTEGER | FK → product_variants.id, NULLABLE | Product variant |
| quantity | INTEGER | DEFAULT 1 | Quantity ordered |
| unit_price | DECIMAL(12,2) | NOT NULL | Price per unit at time of order |
| total_price | DECIMAL(12,2) | NOT NULL | unit_price × quantity |
| createdAt/updatedAt | DATE | | Timestamps |

**Indexes:** `order_id`, `product_id`

### messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Message identifier |
| sender_id | INTEGER | FK → users.id, NOT NULL | Sending user |
| receiver_id | INTEGER | FK → users.id, NOT NULL | Receiving user |
| order_id | INTEGER | FK → orders.id, NULLABLE | Related order |
| product_id | INTEGER | FK → products.id, NULLABLE | Related product |
| content | TEXT | NOT NULL | Message text |
| is_read | BOOLEAN | DEFAULT false | Read status |
| createdAt/updatedAt | DATE | | Timestamps |

**Note:** Messages do NOT use soft deletes (`paranoid: false`).

**Indexes:** `sender_id`, `receiver_id`, `order_id`, composite `(sender_id, receiver_id)`

### reviews

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Review identifier |
| reviewer_id | INTEGER | FK → users.id, NOT NULL | Reviewing user |
| business_id | INTEGER | FK → businesses.id, NOT NULL | Business being reviewed |
| product_id | INTEGER | FK → products.id, NULLABLE | Specific product |
| order_id | INTEGER | FK → orders.id, NULLABLE | Related order |
| rating | INTEGER | NOT NULL | Rating (1-5) |
| comment | TEXT | NULLABLE | Review text |
| createdAt/updatedAt/deletedAt | DATE | | Timestamps |

**Indexes:** `reviewer_id`, `business_id`, `product_id`
**Partial unique index:** `(reviewer_id, order_id) WHERE order_id IS NOT NULL` — prevents duplicate reviews per order

### uploads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Upload identifier |
| uploader_id | INTEGER | FK → users.id, NOT NULL | Uploading user |
| filename | VARCHAR(255) | NOT NULL | Stored filename |
| original_name | VARCHAR(255) | NOT NULL | Original filename |
| mimetype | VARCHAR(100) | NOT NULL | MIME type |
| size | INTEGER | NOT NULL | File size in bytes |
| url | VARCHAR(500) | NOT NULL | File URL path |
| entity_type | VARCHAR(50) | NULLABLE | Associated entity type |
| entity_id | INTEGER | NULLABLE | Associated entity ID |
| createdAt/updatedAt | DATE | | Timestamps |

**Indexes:** `uploader_id`, composite `(entity_type, entity_id)`

### password_reset_tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Token identifier |
| user_id | INTEGER | FK → users.id, NOT NULL | Associated user |
| token | VARCHAR(64) | NOT NULL, UNIQUE | Cryptographic reset token |
| expires_at | DATE | NOT NULL | Token expiration (1 hour) |
| used | BOOLEAN | DEFAULT false | Whether token has been consumed |
| createdAt/updatedAt | DATE | | Timestamps |

**Indexes:** `token` (unique), `user_id`, `expires_at`

## Migrations

14 sequential migrations handle schema evolution:

| # | Migration | Operation |
|---|-----------|-----------|
| 001 | `create-users` | Create users table with email unique index |
| 002 | `create-businesses` | Create businesses table with owner FK |
| 003 | `add-user-profile-fields` | Add avatar, phone, bio, coordinates to users |
| 004 | `create-categories` | Create hierarchical categories with self-referencing parent_id |
| 005 | `enhance-businesses` | Add description, category_id, cover_image to businesses |
| 006 | `create-uploads` | Create uploads table for file management |
| 007 | `create-products` | Create products table with price and stock |
| 008 | `create-product-images` | Create product_images for multiple images per product |
| 009 | `create-product-variants` | Create product_variants for size/color/SKU variations |
| 010 | `create-orders` | Create orders with status tracking and timestamps |
| 011 | `create-order-items` | Create order_items for line items with price snapshots |
| 012 | `create-messages` | Create messages for buyer-seller communication |
| 013 | `create-reviews` | Create reviews with unique constraint per order |
| 014 | `create-password-reset-tokens` | Create password reset tokens in database |

Run migrations:
```bash
npm run db:migrate    # Apply all pending migrations
npm run db:rollback   # Rollback last migration batch
npm run db:status     # Show migration status
```
