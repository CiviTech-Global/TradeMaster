# TradeMaster — Quick Start

Get TradeMaster running in 5 minutes.

## Option A: Docker (Recommended)

```bash
# From project root
cd Server && cp .env.example .env && cd ..
docker-compose up -d --build
```

- Web: http://localhost
- API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- Database: localhost:5432

## Option B: Manual Setup

### 1. Database
```bash
createdb trademaster
```

### 2. Server
```bash
cd Server
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run db:migrate
npm run dev
```

### 3. Web
```bash
cd Web
npm install
cp .env.example .env
npm run dev
```

### 4. Seed Demo Data
```bash
# Sign up first, then use the returned JWT token
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Demo","lastname":"User","email":"demo@test.com","password":"password123"}'

# Seed data (use the accessToken from the response)
curl -X POST http://localhost:3000/dev/seed \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Credentials (after seeding)

```
Email: demo@test.com
Password: password123
```

## Project Structure

```
TradeMaster/
├── Server/          # Node.js + Express API
├── Web/             # React SPA dashboard
├── App/             # Flutter mobile app
├── docs/            # Documentation
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Key URLs

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| API | http://localhost:3000 |
| API Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |
| Database | localhost:5432 |

## What's Next?

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [API.md](./API.md) for endpoint reference
- Read [FEATURES.md](./FEATURES.md) for feature details
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
