# TradeMaster

<img src="./trademaster banner.png" alt="TradeMaster banner" />

A full-stack peer-to-peer marketplace platform enabling individuals to create shops, list physical products and digital services, and transact directly with buyers.

## Tech Stack

| Layer | Technology | Location |
|-------|-----------|----------|
| **Server** | Node.js + Express 5 + PostgreSQL + Sequelize + Socket.io | `Server/` |
| **Web** | React 19 + Redux Toolkit + Vite + TypeScript | `Web/` |
| **Mobile** | Flutter 3 + Riverpod + GoRouter + Dio | `App/` |

## Quick Start

### Docker (Recommended)

```bash
cd Server && cp .env.example .env && cd ..
docker-compose up -d --build
```

- **Web:** http://localhost
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs

### Manual Setup

```bash
# Database
createdb trademaster

# Server
cd Server && npm install && cp .env.example .env
npm run db:migrate && npm run dev

# Web (new terminal)
cd Web && npm install && cp .env.example .env
npm run dev
```

### Seed Demo Data

```bash
# Sign up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Demo","lastname":"User","email":"demo@test.com","password":"password123"}'

# Seed (use accessToken from response)
curl -X POST http://localhost:3000/dev/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Features

### For Buyers
- **Explore** — Browse products on an interactive map with location-based search
- **Search** — Find products and businesses by keyword, category, and location
- **Cart & Checkout** — Add products to cart, checkout with shipping details
- **Orders** — Track order status from pending to delivered
- **Messaging** — Chat directly with sellers in real-time
- **Reviews** — Rate and review businesses after delivery

### For Sellers
- **Shop Creation** — Create a business with branding, location, and contact info
- **Product Listings** — Add products with images, variants, pricing, and stock
- **Order Management** — Confirm, ship, deliver, or cancel orders
- **Customer Communication** — Real-time messaging with typing indicators
- **Reviews** — View and respond to customer feedback

### Platform Features
- **JWT Authentication** — Secure sign-in with access/refresh token pairs
- **Real-Time Messaging** — WebSocket-powered chat with typing indicators and read receipts
- **Geolocation** — Haversine-based nearby product search
- **Image Upload** — Multi-image support with drag-and-drop
- **Input Validation** — Zod schemas on all endpoints
- **Rate Limiting** — Protection against abuse
- **Interactive Maps** — Leaflet (Web) and flutter_map (Mobile)
- **Responsive Design** — Works on desktop, tablet, and mobile

## Architecture

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Web (SPA)  │   │ Mobile App   │   │   Server     │
│   React 19   │   │ Flutter 3    │   │   Express 5  │
│   Redux TK   │   │ Riverpod     │   │   PostgreSQL │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
                 ┌────────▼────────┐
                 │   PostgreSQL    │
                 └─────────────────┘
```

- **Server:** Clean architecture (presentation → application → domain → infrastructure)
- **Web:** Redux for state, Axios for HTTP, React Router for navigation
- **Mobile:** Riverpod for state, Dio for HTTP, GoRouter for navigation

## Project Structure

```
TradeMaster/
├── Server/                    # Backend API
│   ├── application.layer/     # Controllers (business logic)
│   ├── domain.layer/          # Models and interfaces
│   ├── infrastructure.layer/  # Database, utils, validation, WebSocket
│   ├── presentation.layer/    # Express routes
│   ├── __tests__/             # Vitest tests
│   └── server.ts              # Entry point
├── Web/                       # Frontend SPA
│   └── src/
│       ├── application/       # Redux store, slices, hooks
│       ├── domain/            # TypeScript interfaces
│       ├── infrastructure/    # HTTP services, repositories
│       └── presentation/      # Pages, components, context
├── App/                       # Flutter mobile app
│   └── lib/
│       ├── core/              # Network, constants, theme, utils
│       ├── data/              # Models, datasources, repositories
│       ├── domain/            # Entities, repository interfaces
│       └── presentation/      # Screens, providers, widgets
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # System design
│   ├── API.md                 # Complete API reference
│   ├── DATABASE.md            # Schema documentation
│   ├── FEATURES.md            # Feature breakdown
│   ├── DEPLOYMENT.md          # Production guide
│   └── QUICKSTART.md          # 5-minute setup
├── docker-compose.yml         # Container orchestration
└── .github/workflows/ci.yml   # CI/CD pipeline
```

## API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Create account | No |
| POST | `/auth/signin` | Sign in | No |
| POST | `/auth/refresh-token` | Refresh JWT | No |
| GET | `/businesses` | List businesses | No |
| POST | `/businesses` | Create business | Yes |
| GET | `/products` | List products | No |
| GET | `/products/nearby` | Nearby products | No |
| POST | `/products` | Create product | Yes |
| POST | `/products/:id/images` | Upload images | Yes |
| POST | `/orders` | Create order | Yes |
| PATCH | `/orders/:id/status` | Update status | Yes |
| POST | `/messages` | Send message | Yes |
| GET | `/messages/conversations` | List conversations | Yes |
| POST | `/reviews` | Create review | Yes |
| GET | `/search` | Search everything | No |
| GET | `/categories` | List categories | No |

Full API reference: [docs/API.md](docs/API.md)

## Database

PostgreSQL with 14 migrations covering: users, businesses, categories, products, images, variants, orders, order items, messages, reviews, uploads, and password reset tokens.

Schema documentation: [docs/DATABASE.md](docs/DATABASE.md)

## Security

- **JWT** — Access tokens (7d) + refresh tokens (30d) with separate secrets
- **bcrypt** — Password hashing with 10 salt rounds
- **Rate Limiting** — 200 req/15min general, 20 req/15min auth
- **Zod Validation** — Input validation on all mutating endpoints
- **Helmet** — HTTP security headers
- **CORS** — Configurable per environment
- **Ownership Checks** — Resources modifiable only by owner

## Deployment

- **Docker** — Multi-stage builds, non-root user, health checks
- **docker-compose** — One-command local setup
- **GitHub Actions** — CI pipeline: typecheck → lint → test → build
- **Production** — See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and data flow |
| [API Reference](docs/API.md) | All endpoints with examples |
| [Database Schema](docs/DATABASE.md) | Table structures and relationships |
| [Features](docs/FEATURES.md) | Complete feature breakdown |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Quick Start](docs/QUICKSTART.md) | 5-minute setup guide |

## License

See [LICENSE](LICENSE) for details.
