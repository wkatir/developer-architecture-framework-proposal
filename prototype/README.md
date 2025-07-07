# DFAP Integration API

NestJS-based integration layer for Zoho One modules with TypeScript and PostgreSQL.

## Features

- REST API for Zoho webhook processing
- PostgreSQL database with TypeORM
- Redis caching and job queues
- JWT authentication
- OpenAPI/Swagger documentation
- Docker containerization

## Prerequisites

- Node.js ≥18
- Docker & Docker Compose
- PostgreSQL
- Redis

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Run development server**
   ```bash
   npm run start:dev
   ```

5. **Access API documentation**
   ```
   http://localhost:3000/api/docs
   ```

## API Endpoints

- `POST /api/v1/zoho/webhook/:module` - Process Zoho webhooks
- `GET /api/v1/zoho/projects` - List projects
- `POST /api/v1/zoho/projects` - Create project
- `GET /api/v1/zoho/analytics` - Analytics dashboard
- `GET /health` - Health check

## Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## Environment Variables

See `env.example` for required configuration:

- Database settings (PostgreSQL)
- Redis configuration
- Zoho API credentials
- JWT secrets
- Port and CORS settings

## Docker

```bash
# Build image
docker build -t dfap-api .

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f api
``` 