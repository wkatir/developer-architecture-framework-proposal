# Prototype Skeleton

## Overview
- Receives Zoho webhooks and publishes to RabbitMQ.
- Stub endpoint to fetch merged data from PostgreSQL & Neo4j.

## Setup
1. Copy `env.example` → `.env`
2. Run:
   ```bash
   docker-compose up -d
   ```

3. Test:
   * `POST http://localhost:3000/zoho/webhook`
   * `GET  http://localhost:3000/projects/123` 