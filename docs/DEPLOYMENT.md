# TradeMaster — Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn
- Docker & Docker Compose (for containerized deployment)

---

## Local Development

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb trademaster

# Or using Docker
docker run -d --name trademaster-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trademaster \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Server Setup

```bash
cd Server

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=trademaster

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`

### 3. Web Setup

```bash
cd Web

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Edit .env
# VITE_API_BASE_URL=http://localhost:3000

# Start development server
npm run dev
```

Web runs at `http://localhost:5173`

### 4. Flutter Setup

```bash
cd App

# Get dependencies
flutter pub get

# Run on Android emulator
flutter run

# Run on iOS simulator
flutter run -d ios

# Run on connected device
flutter run
```

For physical devices, pass the server IP:
```bash
flutter run --dart-define=API_BASE_URL=http://YOUR_IP:3000
```

---

## Docker Deployment

### Quick Start

```bash
# Clone and navigate to project root
cd TradeMaster

# Create .env file in Server directory
cd Server && cp .env.example .env
# Edit .env — set JWT_SECRET and JWT_REFRESH_SECRET to secure random values
cd ..

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

Services:
- **PostgreSQL**: `localhost:5432`
- **Server**: `http://localhost:3000`
- **Web**: `http://localhost:80`

### Docker Compose Services

```yaml
services:
  db:        # PostgreSQL 16 with health check
  server:    # Node.js 20 Alpine, multi-stage build
  web:       # Nginx Alpine serving built React app
```

### Viewing Logs

```bash
docker-compose logs -f server    # Server logs
docker-compose logs -f web       # Web/nginx logs
docker-compose logs -f db        # Database logs
```

### Stopping Services

```bash
docker-compose down             # Stop containers
docker-compose down -v          # Stop and remove volumes (deletes data)
```

---

## Production Deployment

### Environment Variables

**Server (.env):**
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-secure-db-password
DB_NAME=trademaster

JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-another>
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=https://your-domain.com
```

**Web (.env):**
```bash
VITE_API_BASE_URL=https://api.your-domain.com
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again for a different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Server Build & Deploy

```bash
cd Server

# Install production dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Run migrations
npm run db:migrate

# Start production server
npm start
```

### Web Build & Deploy

```bash
cd Web

# Install dependencies
npm ci

# Build for production
npm run build

# Output is in dist/ — serve with any static file server
# Or deploy to Vercel, Netlify, AWS S3, etc.
```

### Docker Production Build

```bash
# Build images
docker-compose build

# Start in production mode
docker-compose up -d --build
```

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

**Triggers:** Push to `main` or `develop`, pull requests to `main` or `develop`.

**Jobs:**

1. **Server Tests & Lint**
   - Spins up PostgreSQL 16 service container
   - Runs `npm run typecheck`
   - Runs `npm run lint`
   - Runs `npm test -- --run`

2. **Web Build & Lint**
   - Runs `npm run lint`
   - Runs `npx tsc --noEmit`
   - Runs `npm run build`

3. **Docker Build** (main branch only, after server+web pass)
   - Builds server Docker image
   - Builds web Docker image
   - Uses GitHub Actions cache

---

## Database Management

### Migrations

```bash
npm run db:migrate     # Apply all pending migrations
npm run db:rollback    # Rollback last migration batch
npm run db:status      # Show migration status
```

### Seeding Demo Data

Via API (requires authentication):
```bash
curl -X POST http://localhost:3000/dev/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Creates: 6 categories, 3 businesses, 9 products, 9 images, 2 orders, 2 reviews, 3 messages.

### Backup

```bash
# Backup
pg_dump -U postgres trademaster > backup.sql

# Restore
psql -U postgres trademaster < backup.sql
```

---

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "uptime": 3600.123,
  "timestamp": "2026-07-12T00:00:00.000Z"
}
```

### API Documentation

```bash
# Swagger UI (non-production)
open http://localhost:3000/api-docs

# OpenAPI JSON spec
curl http://localhost:3000/api-docs.json
```

### Request Logging

All requests are logged with:
- HTTP method and URL
- Response status code
- Duration in milliseconds
- Client IP (for 4xx/5xx responses)
- Log level (INFO/WARN/ERROR)

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection
psql -h localhost -U postgres -d trademaster -c "SELECT 1;"
```

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in .env
PORT=3001
```

### Migration Failures

```bash
# Check migration status
npm run db:status

# If stuck, manually update migration state
psql -U postgres trademaster -c "DELETE FROM SequelizeMeta WHERE name='014-create-password-reset-tokens.ts';"

# Re-run migrations
npm run db:migrate
```

### Docker Issues

```bash
# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# Check container logs
docker-compose logs server
```
