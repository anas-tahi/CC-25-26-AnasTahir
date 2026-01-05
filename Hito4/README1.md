# Hito 4: Composición de Servicios

## Overview

This project implements a microservices-based application using Docker Compose. The system consists of three backend services (auth, products, comments), a React frontend, and MongoDB for data storage. Each service is containerized and orchestrated through a `compose.yaml` file located at the project root.

---

## Project Structure

```
.
├── compose.yaml                      # Main orchestration file
├── .github/workflows/
│   └── docker-publish.yml            # CI/CD pipeline
└── Hito 4/
    ├── README1.md
    ├── docker-compose.yml
    ├── backend/
    │   ├── auth-service/
    │   │   ├── Dockerfile
    │   │   ├── .env.example
    │   │   ├── server.js
    │   │   └── package.json
    │   ├── product-service/
    │   │   ├── Dockerfile
    │   │   ├── .env.example
    │   │   ├── server.js
    │   │   ├── seedProducts.js
    │   │   └── package.json
    │   └── comment-service/
    │       ├── Dockerfile
    │       ├── .env.example
    │       ├── server.js
    │       └── package.json
    └── frontend/
        ├── Dockerfile
        ├── package.json
        └── src/
```

---

## Cluster Architecture

### Containers

The cluster consists of 5 containers:

1. **mongo** — Data persistence layer (MongoDB 7.0)
2. **auth-service** — Handles user authentication and JWT generation
3. **product-service** — Product catalog, search, and price comparisons
4. **comment-service** — User comments management
5. **frontend** — React UI application

### Why Separate Containers?

Each microservice is isolated to:
- Enable independent scaling and deployment
- Isolate failures (one service crash doesn't affect others)
- Allow teams to work on services independently
- Simplify testing and debugging

### Data Persistence

The cluster uses a named volume `mongo-data` that maps to `/data/db` in the mongo container. This ensures database data persists even after `docker compose down`.

### Port Mapping

| Service | Container Port | Host Port | Purpose |
|---------|---|---|---|
| MongoDB | 27017 | 27017 | Database access |
| Auth Service | 4000 | 4000 | Authentication API |
| Product Service | 5000 | 5000 | Product API |
| Comment Service | 6000 | 6060 | Comments API |
| Frontend | 3000 | 3000 | React app |

### Startup Order

The cluster uses health checks and `depends_on` conditions to ensure proper startup sequence:

```
1. mongo starts (health check enabled)
2. Backend services wait for mongo to be healthy
3. Frontend waits for all backend services
4. Cluster ready for requests
```

This prevents connection errors from services starting before their dependencies.

---

## Base Image & Dockerfile Design

### Why node:20-alpine?

- **Size**: ~40 MB (vs ~900 MB with ubuntu) → faster pulls and deployments
- **Speed**: Starts in ~500ms vs 2s with heavier images
- **Security**: Minimal attack surface, smaller base for vulnerabilities
- **Standard**: Industry standard for containerized Node.js apps

### Layer Caching Strategy

All Dockerfiles follow this structure:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE <PORT>
CMD ["node", "server.js"]
```

**Why this order?**
- `package.json` copied first → if dependencies don't change, Docker reuses the npm install layer
- Application code copied last → code changes don't trigger npm reinstall
- Build time: ~10 seconds (code change only) vs ~2 minutes (with npm reinstall)

---

## Configuration & Environment Variables

### Configuration as Code

Each service reads its configuration from `.env` files:

```yaml
auth-service:
  env_file:
    - ./backend/auth-service/.env
```

This approach:
- Keeps the same Docker image across dev, test, and production
- Secrets are injected at runtime, not baked into images
- Makes credential rotation easy without rebuilding

### Environment Variables

Each service has a `.env.example` template:

**auth-service/.env.example:**
```
MONGO_URI=mongodb://mongo:27017/auth
JWT_SECRET=your_secret_here
NODE_ENV=development
```

**product-service/.env.example:**
```
PRODUCT_MONGO_URI=mongodb://mongo:27017/products
NODE_ENV=development
```

**comment-service/.env.example:**
```
COMMENT_MONGO_URI=mongodb://mongo:27017/comments
NODE_ENV=development
```

---

## Running the Application

### Prerequisites

- Docker and Docker Compose installed
- 2 GB disk space available
- Ports 3000, 4000, 5000, 6060, 27017 available

### Start the Cluster

From project root:

```bash
docker compose down        # Clean up any previous containers
docker compose up --build  # Build images and start services
```

Wait for all services to start (check logs with `docker compose logs`).

### Seed Sample Data

```bash
docker compose exec product-service node seedProducts.js
```

Verify:
```bash
curl http://localhost:5000/products/recommendations
```

### Stop the Cluster

```bash
docker compose down        # Stop and remove containers
docker compose down -v     # Also remove volumes/data
```

### Run Tests

```bash
docker compose exec product-service npm test
docker compose exec auth-service npm test
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/products/recommendations` | GET | Recommended products |
| `/products/names/:prefix` | GET | Search by prefix |
| `/products/:name` | GET | Product details |
| `/products/compare-all` | GET | Price comparison (all) |
| `/products/compare/:name` | GET | Price comparison (single) |
| `/comments` | GET | List comments |
| `/comments` | POST | Add comment |
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |

---

## Orchestration Features

### Health Checks

MongoDB includes a health check:

```yaml
healthcheck:
  test: ["CMD-SHELL", "exit 0"]
  interval: 30s
  timeout: 10s
  retries: 1
```

Backend services wait for this to pass before connecting.

### Auto-Restart

```yaml
restart: unless-stopped
```

If a service crashes, Docker automatically restarts it. Restarts only stop when `docker compose down` is called.

### Dependency Management

```yaml
product-service:
  depends_on:
    mongo:
      condition: service_healthy
```

Services only start when their dependencies are ready and healthy.

---

## GitHub Actions CI/CD

### Workflow File

`.github/workflows/docker-publish.yml` handles:

1. **Build** — Builds Docker images for all 4 services
2. **Publish** — Pushes to GitHub Container Registry (GHCR)
3. **Test** — Runs integration tests:
   - Starts the full cluster
   - Waits for services to be ready
   - Hits 3 endpoints to verify they respond
   - Cleans up

### Automatic Triggers

The workflow runs on every push to `main`:

```yaml
on:
  push:
    branches: [ "main" ]
```

### Image Publishing

Images are published to:
- `ghcr.io/<username>/auth-service:latest`
- `ghcr.io/<username>/product-service:latest`
- `ghcr.io/<username>/comment-service:latest`
- `ghcr.io/<username>/frontend:latest`

---

## Integration Tests

The CI/CD workflow includes integration tests:

```bash
# Start cluster
docker compose up -d --build

# Wait for services
sleep 12

# Smoke tests
curl http://localhost:4000/          # Auth service
curl http://localhost:5000/products  # Product service
curl http://localhost:6060/comments  # Comment service

# Cleanup
docker compose down -v
```

These tests run automatically on every push to `main`.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Port already in use | Stop services: `docker compose down` |
| Services won't start | Check logs: `docker compose logs <service>` |
| Database connection error | Verify mongo is running: `docker compose ps mongo` |
| Tests fail | Check GitHub Actions logs in repository |
| Build fails | Verify dependencies in `package.json` |

---

## Design Decisions

| Choice | Reason |
|---|---|
| Three services | Demonstrates microservices principles |
| MongoDB in Docker | Simplifies local development |
| Named volume | Persists data across restarts |
| Health checks | Ensures proper startup order |
| Alpine base image | Small footprint, fast startup |
| env_file configuration | Same image works in dev/test/prod |
| GitHub Actions | Automates build, test, publish |

---

## Deliverables

✅ Multiple Dockerfiles (4 total — one per service)  
✅ Data container with persistent volume (mongo + mongo-data)  
✅ Port mapping (internal and external)  
✅ Cluster configuration (health checks, depends_on, env_file)  
✅ Configuration-as-code (environment variables)  
✅ compose.yaml at project root  
✅ GitHub Packages publishing (GHCR)  
✅ Automatic builds on push (GitHub Actions)  
✅ Integration tests (smoke tests in CI/CD)  
✅ Full documentation (this README)  

---
## Security Considerations

1. **Don't commit `.env` files** — They contain secrets and are in `.gitignore`
2. **Use `.env.example`** — Shows what variables are needed
3. **GitHub Actions Secrets** — Store sensitive values (DB URIs, API keys)
4. **Health checks** — Services only accessible when ready
5. **Base image updates** — Use `docker pull` to get latest patches


