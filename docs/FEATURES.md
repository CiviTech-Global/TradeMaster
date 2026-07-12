# TradeMaster — Feature Reference

Complete feature breakdown based on the actual codebase implementation.

---

## 1. User Authentication & Account Management

### Sign Up
- First name, last name, email, password registration
- Email format validation (server + client)
- Password minimum 6 characters
- Duplicate email detection (409 conflict)
- Immediate sign-in after registration (JWT tokens returned)

### Sign In
- Email + password authentication
- bcrypt password comparison
- JWT access token (7-day expiry) + refresh token (30-day expiry)
- Tokens stored in localStorage (Web) or flutter_secure_storage (Flutter)

### Password Reset
- Forgot password sends a cryptographic reset token (32-byte random hex)
- Tokens stored in PostgreSQL `password_reset_tokens` table
- 1-hour expiration, one-time use
- Previous tokens invalidated when new one is created
- Reset link logged to console in development

### Token Refresh
- Automatic token refresh on 401 responses
- Both Web and Flutter interceptors handle this transparently
- New tokens replace old ones in storage

### Profile Management
- Update firstname, lastname, phone, bio
- Upload avatar image (JPEG/PNG/WebP/GIF, max 5MB)
- Old avatar file deleted when new one is uploaded
- Email displayed but not editable (for security)

### Password Change
- Requires current password verification
- New password hashed with bcrypt before storage

---

## 2. Business Management

### Create Business
- Title, address, description
- GPS coordinates (latitude/longitude) with validation (-90..90, -180..180)
- Contact emails array (at least one required, format validated)
- Contact phones array (at least one required, format validated)
- Category selection (optional)
- Logo and cover image uploads
- Active/inactive toggle

### Edit Business
- All fields updateable independently
- Coordinate and contact validation on updates
- At least one field required for update

### Business Map Location
- Interactive map picker (Leaflet on Web, flutter_map on Flutter)
- Click to set exact coordinates
- Visual marker showing selected location

### Business Listing
- View all businesses with owner info and category
- Filter active-only businesses
- View businesses by specific owner
- Business detail page with products, reviews, and map

---

## 3. Product Management

### Create Product
- Title, description, price, currency (default USD)
- Stock quantity tracking
- Category assignment
- Active/inactive status
- Must own the business to add products (ownership verified)

### Product Images
- Upload up to 5 images per product (JPEG/PNG/WebP/GIF, max 5MB each)
- Set primary display image
- Custom sort ordering
- Alt text for accessibility
- Individual image deletion

### Product Variants
- Create variants with name/value pairs (e.g., "Color": "Blue")
- Per-variant price modifier (added to base price)
- Per-variant stock quantity
- SKU tracking
- Active/inactive per variant

### Product Browsing
- Paginated product listing (default 20 per page)
- Filter by business, category, price range
- Text search in title and description
- Sort by various fields
- Geolocation-based nearby product search (Haversine formula)

### Product Detail
- Full product info with images, variants, business, category
- Image carousel/gallery
- Variant selector with price adjustment
- Stock availability display

---

## 4. Geolocation & Maps

### Nearby Products
- Haversine distance calculation for radius-based search
- Configurable radius (default 10km, max 100km)
- Results sorted by distance
- Latitude/longitude parameters for user location

### Business Maps (Web)
- Full-screen interactive Leaflet map
- Business markers with click-to-navigate
- User location marker
- Trading data points overlay
- Static location markers
- Map overlay support
- Heatmap visualization
- Zoom controls (global view at zoom 8)

### Business Maps (Flutter)
- FlutterMap with OpenStreetMap tiles
- Business markers with navigation to detail
- User location indicator
- Category filter chips

### Location Selection
- Map-based location picker for business creation
- Click to set coordinates
- Visual feedback with marker

---

## 5. Orders & Checkout

### Cart System (Flutter)
- Add products to cart with quantity
- Adjust quantity (increment/decrement)
- Remove items from cart
- Clear entire cart
- Items grouped by business for checkout

### Checkout (Flutter)
- Shipping address input
- Optional delivery coordinates
- Order notes
- Places one order per business
- Success confirmation with navigation to orders

### Create Order (API)
- Validate all products exist and are active
- Validate sufficient stock for each item
- Atomic stock decrement (transactional)
- Generate unique order number (TM-YYYYMMDD-NNNN)
- Capture price at time of order (unit_price snapshot)
- Support product variants with price modifiers

### Order Status Management
- Status flow: `pending` → `confirmed` → `in_transit` → `delivered`
- Buyer can only cancel (with reason)
- Seller can confirm, ship, deliver, or cancel
- Cancellation restores stock quantities (atomic)
- Status timestamps tracked (confirmed_at, shipped_at, delivered_at, cancelled_at)

### Order Listing
- Buyer sees their orders
- Seller sees orders per business
- Status filter tabs
- Pagination support
- Expandable detail rows showing line items

---

## 6. Messaging

### Conversations
- List all conversation partners
- Last message preview per conversation
- Unread message count per conversation
- Total unread count (badge on navigation)

### Chat
- Paginated message thread
- Real-time message sending (30s polling on mobile, WebSocket on web)
- Auto-scroll to latest message
- Date separators between message groups
- Read receipts (auto-marks messages as read when opened)
- Link messages to orders or products

### Real-Time Features (WebSocket)
- Socket.io connection with JWT authentication
- Typing indicators (show when partner is typing)
- Read receipts (notify when messages are read)
- New message notifications across tabs/devices
- Conversation room management (join/leave)

---

## 7. Reviews & Ratings

### Create Review
- 1-5 integer rating
- Optional text comment (max 2000 characters)
- Linked to business, optionally to product and order
- Must have a delivered order to review (if order_id provided)
- Duplicate review prevention per order

### Review Listing
- Paginated reviews per business
- Paginated reviews per product
- Average rating and total count stats
- Reviewer info (name, avatar)
- Star rating visualization

### Review Management
- Edit own reviews (rating and comment)
- Delete own reviews

---

## 8. Search

### Unified Search
- Search across products and businesses simultaneously
- Text matching in title, description, name
- Filter by type (all, products, businesses)
- Category filtering
- Location-aware results (lat/lng/radius)
- Debounced search on Flutter (400ms)

---

## 9. Categories

### Category Hierarchy
- Self-referencing parent-child relationships
- Auto-generated URL slugs from names
- Sort ordering
- Icon support
- Active/inactive toggle
- Filter by parent_id

---

## 10. File Uploads

### Upload System
- Single and multiple file upload endpoints
- MIME type validation (JPEG, PNG, WebP, GIF)
- File size limit (5MB)
- Unique filename generation (timestamp + random string)
- Upload records tracked in database with entity association
- Avatar management (replace old file on update)
- Serve static files from `/uploads` path

---

## 11. Web Dashboard Features

### Landing Page
- Marketing hero section with call-to-action
- Features grid highlighting platform capabilities
- How-it-works steps
- Featured businesses (fetched from API)
- Responsive footer

### Dashboard Home
- Full-screen interactive trading map
- Financial data visualization
- Business location markers
- Heatmap overlays

### My Businesses
- Business listing table
- Create/edit business form with map picker
- Category selection
- Contact information management

### Products
- Product table per business
- Create/edit product form
- Image upload with preview
- Variant management

### Orders
- Order listing with status tabs
- Expandable order details
- Status update actions (confirm/ship/deliver/cancel)
- Cancellation reason input

### Messages
- Two-panel layout (conversations + chat)
- Real-time message sending
- Read receipts
- 30-second polling for updates

### Reviews
- Review listing with rating tabs
- Business filter
- Star rating visualization
- Aggregated statistics

### Profile
- Avatar upload with preview
- Personal information editing
- Password change

### Settings
- Profile display
- Password change form

---

## 12. Mobile App Features

### Navigation
- Bottom navigation with 5 tabs: Explore, Search, Orders, Messages, Profile
- Unread message badge on Messages tab
- Auth guards (redirect to sign-in if not authenticated)
- Splash screen during session restoration

### Explore Tab
- Interactive map with business markers
- Category filter chips
- Nearby products grid
- Pull-to-refresh

### Search Tab
- Debounced search input
- Category filter
- Combined product and business results
- Navigate to detail screens

### Auth Flow
- Sign in / Sign up screens
- Form validation
- Loading overlays
- Error handling with user-friendly messages
- Session restore from secure storage

---

## 13. Security Features

### Authentication
- JWT with separate access/refresh token secrets
- bcrypt password hashing (10 salt rounds)
- Token type validation (access vs refresh)
- Issuer and audience validation on tokens

### Authorization
- JWT middleware on protected routes
- Ownership verification before resource modification
- Role-based order status updates (buyer vs seller)
- Optional JWT middleware for public routes with optional auth

### Input Validation
- Zod schemas for all mutating endpoints
- Type-safe validation with detailed error messages
- Email format validation
- Phone format validation
- Coordinate range validation
- Rating range validation (1-5 integer)
- Password length validation (minimum 6)

### API Security
- Helmet HTTP security headers
- CORS configuration (permissive in dev, locked in production)
- Rate limiting (200 req/15min general, 20 req/15min auth)
- Request size limits (10MB JSON, 5MB file uploads)
- Graceful shutdown on SIGTERM/SIGINT

### Data Protection
- Passwords excluded from API responses
- Soft deletes preserve data integrity
- Inactive users/businesses/products filtered from public listings
- Secure random tokens for password reset (32 bytes)

---

## 14. Developer Experience

### API Documentation
- Swagger UI at `/api-docs` (non-production)
- OpenAPI 3.0 JSON spec at `/api-docs.json`
- All schemas documented with examples

### Database Migrations
- Sequential numbered migrations (001-014)
- Up/down migration support
- Migration status tracking
- Umzug-based migration runner

### Testing
- Vitest test framework
- Validation schema tests (23 tests)
- Coverage reporting configured

### Environment Configuration
- Centralized env validation (`infrastructure.layer/config/env.ts`)
- `.env.example` files for Server and Web
- Secure secret generation in development
- Required secrets in production

### Logging
- Structured logger with context tagging
- Request/response logging middleware with duration tracking
- Debug level suppressed in production
- Error stack traces in development only

### Docker
- Multi-stage Dockerfiles (minimal production images)
- Non-root user in production
- Health check configured
- Volume persistence for database and uploads
- docker-compose for local development

### CI/CD
- GitHub Actions pipeline
- Server: typecheck → lint → test
- Web: lint → typecheck → build
- Docker image builds on main branch
- PostgreSQL service container for tests
