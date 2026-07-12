# TradeMaster — System Architecture

## Overview

TradeMaster is a full-stack peer-to-peer marketplace platform enabling individuals to create shops, list physical products and digital services, and transact directly with buyers. The codebase is a monorepo with three distinct client/server layers sharing a consistent API contract.

```
┌─────────────────────────────────────────────────────────┐
│                     TradeMaster                         │
├─────────────┬───────────────────┬───────────────────────┤
│  Web (SPA)  │  Mobile App       │  Server (REST API)    │
│  React 19   │  Flutter 3.x      │  Node.js + Express 5  │
│  Redux TK   │  Riverpod         │  PostgreSQL + Sequelize│
│  Vite       │  GoRouter         │  Socket.io (WebSocket)│
│  TypeScript │  Dart             │  TypeScript           │
└──────┬──────┴────────┬──────────┴───────────┬───────────┘
       │               │                      │
       └───────────────┼──────────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   Database      │
              └─────────────────┘
```

## Three-Layer Architecture

### Server (`Server/`)

The server follows a clean architecture pattern with three explicit layers:

```
Server/
├── presentation.layer/       # Express routes (HTTP interface)
│   └── routes/              # Route definitions with middleware
├── application.layer/        # Controllers (business logic)
│   └── controllers/         # Request handlers
├── domain.layer/             # Data models and interfaces
│   ├── interfaces/          # TypeScript interfaces
│   └── models/              # Sequelize models with decorators
└── infrastructure.layer/    # External integrations
    ├── config/              # Environment configuration
    ├── database/            # Sequelize, migrations, config
    ├── docs/                # Swagger/OpenAPI documentation
    ├── utils/               # JWT, auth, logging, query functions
    ├── validation/          # Zod schemas and middleware
    └── websocket/           # Socket.io real-time messaging
```

**Request flow:**
```
HTTP Request → Express Router → Zod Validation → JWT Middleware → Controller → Util/Query → Sequelize → PostgreSQL
```

### Web Client (`Web/`)

The web client uses a clean architecture pattern with Redux for state management:

```
Web/src/
├── domain/types/            # TypeScript interfaces
├── infrastructure/
│   ├── api/                 # HTTP services (TMAxios, NetworkService, authInterceptor)
│   └── repositories/        # Data access layer (user.repo)
├── application/
│   ├── redux/               # Store, slices (auth, ui), selectors, hooks
│   └── hooks/               # Application-level hooks (useAuth)
└── presentation/
    ├── components/          # Reusable UI components
    ├── pages/               # Page components (auth, dashboard, landing)
    ├── context/             # (removed — Redux handles all state)
    └── hooks/               # (removed — Redux hooks only)
```

**State flow:**
```
Component → useAppDispatch → Redux Thunk → Repository → NetworkService → TMAxios → Server API
                ↓
Component ← useAppSelector ← Redux Store ← Thunk Response
```

### Mobile App (`App/`)

The Flutter app follows clean architecture with Riverpod for state management:

```
App/lib/
├── core/
│   ├── constants/           # API URLs, app-wide constants
│   ├── network/             # Dio HTTP client, API interceptor
│   ├── theme/               # Material 3 theme (light + dark)
│   └── utils/               # Validators, JSON parsing
├── domain/
│   ├── entities/            # Plain Dart objects (User)
│   └── repositories/       # Abstract repository interfaces
├── data/
│   ├── datasources/         # Remote API datasources
│   ├── models/              # JSON-serializable data models
│   └── repositories/       # Repository implementations
└── presentation/
    ├── providers/           # Riverpod providers and notifiers
    ├── screens/             # Screen widgets
    └── widgets/             # Reusable widgets
```

**State flow:**
```
Widget → ref.read(provider.notifier).action() → Repository → Datasource → Dio → Server API
   ↓
Widget ← ref.watch(provider) ← StateNotifier ← Response
```

## Authentication

All three layers implement JWT-based authentication with access/refresh token pairs:

1. **Sign in/up** → Server validates credentials, returns `{ user, accessToken, refreshToken }`
2. **Token storage** → Web: localStorage; Flutter: flutter_secure_storage
3. **Request auth** → Bearer token in Authorization header
4. **Token refresh** → On 401 response, interceptor calls `/auth/refresh-token` and retries
5. **Session restore** → On app load, stored token is used to restore session without re-login

```
┌──────────┐     POST /auth/signin     ┌──────────┐
│  Client  │ ─────────────────────────→ │  Server  │
│          │ ←───────────────────────── │          │
│          │   { user, tokens }         │          │
│          │                            │          │
│          │   GET /products (with JWT) │          │
│          │ ─────────────────────────→ │          │
│          │ ←───────────────────────── │          │
│          │   { data: products }       │          │
│          │                            │          │
│          │   GET /products (expired)  │          │
│          │ ─────────────────────────→ │          │
│          │ ←── 401 Unauthorized ───── │          │
│          │                            │          │
│          │   POST /auth/refresh-token │          │
│          │ ─────────────────────────→ │          │
│          │ ←── { new tokens } ─────── │          │
│          │                            │          │
│          │   GET /products (new JWT)  │          │
│          │ ─────────────────────────→ │          │
│          │ ←── { data: products } ── │          │
└──────────┘                            └──────────┘
```

## Real-Time Messaging (WebSocket)

The server runs Socket.io alongside Express for real-time features:

```
┌──────────┐  Socket.io (JWT auth)  ┌──────────┐
│  User A  │ ←────────────────────→ │  Server  │ ←────────────────────→ │  User B  │
│          │  send_message           │          │  new_message            │          │
│          │  typing_start           │          │  user_typing            │          │
│          │  mark_read              │          │  messages_read          │          │
└──────────┘                        └──────────┘                        └──────────┘
```

- Messages are persisted via HTTP POST, then broadcast via WebSocket
- Typing indicators and read receipts are WebSocket-only
- JWT authentication required on WebSocket connection

## Database Design

PostgreSQL 16 with Sequelize ORM (TypeScript decorators). All tables use soft deletes (paranoid mode) except messages.

**Entity relationships:**
```
User ──┬── has many → Business ──┬── has many → Product ──┬── has many → ProductImage
       │                         │                         └── has many → ProductVariant
       │                         ├── belongs to → Category (self-referencing hierarchy)
       │                         └── has many → Order ──┬── has many → OrderItem
       │                                                └── belongs to → User (buyer)
       ├── has many → Message (sender/receiver)
       ├── has many → Review ──→ Business, Product, Order
       ├── has many → PasswordResetToken
       └── has many → Upload
```

## Security

- **Helmet** — HTTP security headers
- **CORS** — Configurable origin per environment
- **Rate limiting** — 200 req/15min general, 20 req/15min for auth
- **JWT** — Access tokens (7d) + refresh tokens (30d) with separate secrets
- **bcrypt** — Password hashing with 10 salt rounds
- **Zod validation** — Input validation on all mutating endpoints
- **Ownership checks** — Resources can only be modified by their owner
- **Password reset** — Cryptographic tokens stored in database, 1-hour expiry

## Infrastructure

- **Docker** — Multi-stage builds for server (Node 20) and web (Nginx)
- **docker-compose** — PostgreSQL + Server + Web with health checks
- **GitHub Actions** — CI pipeline: typecheck → lint → test → build → Docker
- **Swagger** — Interactive API documentation at `/api-docs` (non-production)
