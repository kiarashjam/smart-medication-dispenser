# Cloud & Deployment Documentation

**Smart Medication Dispenser — Docker, PostgreSQL, Environment Configuration & CI/CD**

**Version 2.0 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.0 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | DevOps & Backend Engineers |
| **Related Documents** | [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md), [02_BACKEND_API.md](./02_BACKEND_API.md), [03_DATABASE.md](./03_DATABASE.md), [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md) |

---

## 1. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Docker Compose Cluster                            │    │
│  │                                                                      │    │
│  │   ┌─────────────────┐         ┌─────────────────┐                   │    │
│  │   │   API Container  │         │  DB Container    │                   │    │
│  │   │                  │         │                  │                   │    │
│  │   │  ASP.NET Core 8  │────────▶│  PostgreSQL 15   │                   │    │
│  │   │  Port: 5000      │  TCP    │  Port: 5432      │                   │    │
│  │   │                  │  5432   │                  │                   │    │
│  │   │  Auto-migrate    │         │  Volume: pgdata  │                   │    │
│  │   │  Auto-seed       │         │  Health check    │                   │    │
│  │   └────────┬─────────┘         └──────────────────┘                   │    │
│  │            │                                                          │    │
│  └────────────┼──────────────────────────────────────────────────────────┘    │
│               │ Port 5000                                                     │
│               ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    External Clients                                   │    │
│  │                                                                      │    │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │    │
│  │   │  Web App  │    │Mobile App│    │  ESP32   │    │ External  │     │    │
│  │   │  :5173    │    │  Expo    │    │ Firmware │    │ Webhooks  │     │    │
│  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘     │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Docker Configuration

### 2.1 Docker Compose

The project uses Docker Compose with two services:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: dispenser
      POSTGRES_PASSWORD: dispenser_secret
      POSTGRES_DB: dispenser
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dispenser -d dispenser"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: src/Api/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:5000
      ConnectionStrings__DefaultConnection: "Host=db;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret"
      Jwt__SecretKey: "SmartMedicationDispenser_MVP_SecretKey_AtLeast32Characters!"
      Jwt__Issuer: "SmartMedicationDispenser"
      Jwt__Audience: "SmartMedicationDispenser"
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

### 2.2 Service Details

| Service | Image | Port | Volume | Health Check |
|:--------|:------|:-----|:-------|:-------------|
| `db` | postgres:15-alpine | 5432:5432 | pgdata (persistent) | `pg_isready` every 5s |
| `api` | Custom (Dockerfile) | 5000:5000 | None | Depends on db health |

### 2.3 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start only database
docker-compose up -d db

# View logs
docker-compose logs -f api
docker-compose logs -f db

# Stop all services
docker-compose down

# Stop and remove volumes (DESTROYS DATA)
docker-compose down -v

# Rebuild API container after code changes
docker-compose up -d --build api

# Check service status
docker-compose ps
```

### 2.4 Dockerfile (Backend API)

The API Dockerfile is located at `backend/src/Api/Dockerfile` and uses a **4-stage multi-stage build**:

```dockerfile
# Stage 1: Runtime base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

# Stage 2: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Copy csproj files and restore NuGet packages
COPY ["src/Domain/Domain.csproj", "Domain/"]
COPY ["src/Application/Application.csproj", "Application/"]
COPY ["src/Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["src/Api/Api.csproj", "Api/"]
RUN dotnet restore "Api/Api.csproj"
# Copy source and build
COPY src/Domain Domain/
COPY src/Application Application/
COPY src/Infrastructure Infrastructure/
COPY src/Api Api/
RUN dotnet build "Api/Api.csproj" -c Release -o /app/build

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "Api/Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
```

**Key optimizations:**
- NuGet restore is cached (csproj files copied first)
- Build and publish stages separated for layer caching
- Final image uses slim `aspnet:8.0` runtime (not full SDK)
- `UseAppHost=false` for smaller output

---

## 3. PostgreSQL Database

### 3.1 Connection Details

| Setting | Development | Docker | Production |
|:--------|:------------|:-------|:-----------|
| Host | localhost | db (Docker network) | \<your-host\> |
| Port | 5432 | 5432 | 5432 |
| Database | dispenser | dispenser | dispenser |
| Username | dispenser | dispenser | \<secure-user\> |
| Password | dispenser_secret | dispenser_secret | \<secure-password\> |

### 3.2 Connection String Format

```
# PostgreSQL
Host=<host>;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret

# SQLite (local development)
Data Source=dispenser.db
```

### 3.3 Database Management

```bash
# Connect to PostgreSQL in Docker
docker-compose exec db psql -U dispenser -d dispenser

# Common psql commands
\dt              # List tables
\d+ Users        # Describe Users table
\l               # List databases
\q               # Quit

# Backup database
docker-compose exec db pg_dump -U dispenser dispenser > backup.sql

# Restore database
docker-compose exec -T db psql -U dispenser dispenser < backup.sql
```

### 3.4 PostgreSQL Configuration

The default PostgreSQL Alpine image includes sensible defaults. For production tuning:

| Parameter | Default | Recommended (Prod) | Description |
|:----------|:--------|:-------------------|:------------|
| `max_connections` | 100 | 200 | Max concurrent connections |
| `shared_buffers` | 128MB | 256MB-1GB | Shared memory for caching |
| `effective_cache_size` | 4GB | 75% of RAM | Planner cache estimate |
| `work_mem` | 4MB | 16MB | Memory per sort/hash operation |
| `maintenance_work_mem` | 64MB | 256MB | Memory for VACUUM, CREATE INDEX |

---

## 4. Environment Configuration

### 4.1 Backend Environment Variables

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| `ASPNETCORE_ENVIRONMENT` | No | Development | Runtime environment (Development, Production) |
| `ASPNETCORE_URLS` | No | http://localhost:5000 | Listen URLs |
| `ConnectionStrings__DefaultConnection` | Yes | PostgreSQL localhost | Database connection string |
| `Jwt__SecretKey` | Yes | Dev default key | JWT signing secret (min 32 chars) |
| `Jwt__Issuer` | No | SmartMedicationDispenser | JWT issuer claim |
| `Jwt__Audience` | No | SmartMedicationDispenser | JWT audience claim |

### 4.2 Web Portal Environment (.env)

```bash
# web/.env
VITE_API_URL=http://localhost:5000
```

| Variable | Default | Description |
|:---------|:--------|:------------|
| `VITE_API_URL` | (empty — uses proxy) | Backend API base URL |

**Note:** In development, Vite proxies `/api` requests to `http://localhost:5000` (configured in `vite.config.ts`), so `VITE_API_URL` can be empty.

### 4.3 Mobile App Environment (.env)

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Default | Description |
|:---------|:--------|:------------|
| `EXPO_PUBLIC_API_URL` | http://localhost:5000 | Backend API base URL |

**Note for physical devices:** Use your machine's local IP (e.g., `http://192.168.1.100:5000`) instead of `localhost`.

---

## 5. Development Setup

### 5.1 Option A: Full Docker Stack

```bash
cd smart-medication-dispenser
docker-compose up -d

# API ready at http://localhost:5000
# Swagger at http://localhost:5000/swagger
# PostgreSQL at localhost:5432
```

### 5.2 Option B: Database in Docker, API Local

```bash
# Start only PostgreSQL
docker-compose up -d db

# Run API locally
cd backend
dotnet restore
dotnet run --project src/Api

# API at http://localhost:5000
```

### 5.3 Option C: Fully Local (SQLite)

```bash
# No Docker needed — use SQLite
cd backend

# Update connection string in appsettings.Development.json:
# "DefaultConnection": "Data Source=dispenser.db"

dotnet restore
dotnet run --project src/Api
```

### 5.4 Running Frontend Applications

```bash
# Web portal (separate terminal)
cd web
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173

# Mobile app (separate terminal)
cd mobile
cp .env.example .env
npm install
npx expo start
# → Scan QR code with Expo Go
```

---

## 6. Production Deployment Guide

### 6.1 Security Checklist

| Item | Action | Priority |
|:-----|:-------|:---------|
| JWT Secret | Use cryptographically random 64+ character key | Critical |
| DB Password | Use strong, unique password | Critical |
| HTTPS | Enable TLS termination (reverse proxy or cloud LB) | Critical |
| CORS | Restrict to specific frontend domains | High |
| API Rate Limiting | Add rate limiting middleware | High |
| DB Backup | Configure automated backups | High |
| Logging | Configure structured logging (Serilog → ELK/Seq) | Medium |
| Health Checks | Add `/health` endpoint for monitoring | Medium |
| Secrets Management | Use Azure Key Vault / AWS Secrets Manager / HashiCorp Vault | High |

### 6.2 Production docker-compose.yml Adjustments

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: dispenser
    # Remove port mapping in production (access only from API container)
    # ports:
    #   - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  api:
    build:
      context: ./backend
      dockerfile: src/Api/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:5000
      ConnectionStrings__DefaultConnection: "Host=db;Port=5432;Database=dispenser;Username=${DB_USER};Password=${DB_PASSWORD}"
      Jwt__SecretKey: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    restart: always
```

### 6.3 Reverse Proxy (Nginx)

For production, place Nginx in front of the API:

```nginx
server {
    listen 443 ssl http2;
    server_name api.smartdispenser.ch;

    ssl_certificate /etc/ssl/certs/smartdispenser.crt;
    ssl_certificate_key /etc/ssl/private/smartdispenser.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Cloud Provider Deployment Options

### 7.1 Azure (Recommended for .NET)

| Service | Resource | Purpose |
|:--------|:---------|:--------|
| Azure App Service | B1-S1 tier | Host ASP.NET Core API |
| Azure Database for PostgreSQL | Flexible Server | Managed PostgreSQL |
| Azure Key Vault | — | Secrets management |
| Azure Container Registry | — | Docker image storage |
| Azure Application Insights | — | Monitoring & telemetry |

### 7.2 AWS

| Service | Resource | Purpose |
|:--------|:---------|:--------|
| ECS Fargate or Elastic Beanstalk | — | Host API container |
| RDS PostgreSQL | db.t3.micro+ | Managed PostgreSQL |
| AWS Secrets Manager | — | Secrets management |
| ECR | — | Docker image storage |
| CloudWatch | — | Logging & monitoring |

### 7.3 Google Cloud

| Service | Resource | Purpose |
|:--------|:---------|:--------|
| Cloud Run | — | Serverless API container |
| Cloud SQL for PostgreSQL | — | Managed PostgreSQL |
| Secret Manager | — | Secrets management |
| Artifact Registry | — | Docker image storage |

---

## 8. Monitoring & Logging

### 8.1 Application Logging

ASP.NET Core uses built-in `ILogger` with configurable levels:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  }
}
```

### 8.2 Log Categories

| Category | Level | What's Logged |
|:---------|:------|:-------------|
| API requests | Information | Request/response timing |
| Device heartbeats | Debug | Each heartbeat received |
| Device events | Information | Event processing |
| Webhook delivery | Information | POST URL + status code |
| Webhook failures | Warning | POST failures |
| Device errors | Error | Device-reported errors |
| Background jobs | Information/Error | Missed dose checks, low stock |
| Unhandled exceptions | Error | Full exception details |

### 8.3 Docker Logs

```bash
# Follow API logs
docker-compose logs -f api

# Follow DB logs
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail 100 api

# Export logs to file
docker-compose logs api > api_logs.txt
```

---

## 9. Backup & Recovery

### 9.1 Database Backup

```bash
# Full backup
docker-compose exec db pg_dump -U dispenser -Fc dispenser > backup_$(date +%Y%m%d).dump

# Plain SQL backup
docker-compose exec db pg_dump -U dispenser dispenser > backup_$(date +%Y%m%d).sql

# Compressed backup
docker-compose exec db pg_dump -U dispenser -Fc -Z 9 dispenser > backup_$(date +%Y%m%d).dump.gz
```

### 9.2 Database Restore

```bash
# Restore from custom format
docker-compose exec -T db pg_restore -U dispenser -d dispenser --clean < backup.dump

# Restore from SQL
docker-compose exec -T db psql -U dispenser dispenser < backup.sql
```

### 9.3 Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Run daily via cron
BACKUP_DIR="/backups/dispenser"
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T db pg_dump -U dispenser -Fc dispenser > "${BACKUP_DIR}/dispenser_${DATE}.dump"

# Keep only last 30 days
find "${BACKUP_DIR}" -name "dispenser_*.dump" -mtime +30 -delete
```

---

## 10. Scaling Considerations

| Aspect | Current (MVP) | Production Recommendation |
|:-------|:-------------|:-------------------------|
| **API instances** | 1 container | 2-4 behind load balancer |
| **Database** | Single PostgreSQL | Managed PostgreSQL with read replicas |
| **Background jobs** | In-process hosted service | Extract to separate worker service |
| **Webhook delivery** | Synchronous in background job | Message queue (RabbitMQ/Azure Service Bus) |
| **Caching** | None | Redis for session/frequent queries |
| **Static assets** | Served by API | CDN for web portal assets |
| **File storage** | Local SQLite DB file | Azure Blob / S3 for images |

---

## 11. CI/CD Pipeline

### 11.1 Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Developer → Git Push → GitHub Actions → Azure               │
│                                                               │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  Build   │──▶│  Test    │──▶│  Docker  │──▶│  Deploy  │  │
│  │         │   │          │   │  Build   │   │          │  │
│  │ dotnet  │   │ dotnet   │   │ Push to  │   │ Azure    │  │
│  │ restore │   │ test     │   │ ACR      │   │ App Svc  │  │
│  │ build   │   │ xunit    │   │          │   │          │  │
│  └─────────┘   └──────────┘   └──────────┘   └──────────┘  │
│       │              │              │              │          │
│       ▼              ▼              ▼              ▼          │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ Lint    │   │ Coverage │   │ Vuln     │   │ Health   │  │
│  │ Check   │   │ Report   │   │ Scan     │   │ Check    │  │
│  └─────────┘   └──────────┘   └──────────┘   └──────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '20.x'
  REGISTRY: smartdispenser.azurecr.io
  IMAGE_NAME: smart-dispenser-api

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}
      
      - name: Restore
        run: dotnet restore
        working-directory: backend
      
      - name: Build
        run: dotnet build --no-restore -c Release
        working-directory: backend
      
      - name: Test
        run: dotnet test --no-build -c Release --collect:"XPlat Code Coverage"
        working-directory: backend
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
        working-directory: web
      - run: npm run build
        working-directory: web
      - run: npx tsc --noEmit
        working-directory: web

  docker-build-push:
    needs: [build-and-test, build-web]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/src/Api/Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy-staging:
    needs: docker-build-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: azure/webapps-deploy@v3
        with:
          app-name: smart-dispenser-staging
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: azure/webapps-deploy@v3
        with:
          app-name: smart-dispenser-prod
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### 11.3 Pipeline Stages

| Stage | Trigger | Duration | Gate |
|:------|:--------|:---------|:-----|
| **Build** | All pushes/PRs | ~2 min | Compilation success |
| **Test** | All pushes/PRs | ~3 min | All tests pass, >80% coverage |
| **Docker Build** | Main branch only | ~5 min | Image builds successfully |
| **Deploy Staging** | After Docker build | ~3 min | Health check passes |
| **Deploy Production** | After staging | ~3 min | Manual approval + health check |

---

## 12. Secrets Management

### 12.1 Secret Categories

| Secret | Environment Variable | Storage | Rotation |
|:-------|:-------------------|:--------|:---------|
| JWT signing key | `Jwt__SecretKey` | Azure Key Vault | Annually |
| DB password | `ConnectionStrings__DefaultConnection` | Azure Key Vault | Quarterly |
| ACR credentials | `ACR_USERNAME`, `ACR_PASSWORD` | GitHub Secrets | Annually |
| SendGrid API key | `SendGrid__ApiKey` | Azure Key Vault | Annually |
| Firebase credentials | `Firebase__ServiceAccount` | Azure Key Vault | Annually |

### 12.2 Azure Key Vault Integration

```csharp
// Program.cs
if (builder.Environment.IsProduction())
{
    var keyVaultUri = new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/");
    builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
}
```

### 12.3 Secret Rotation Procedure

```
1. Generate new secret value
2. Add new version to Azure Key Vault
3. Restart application (picks up new secret)
4. Verify application health
5. Archive old secret version (do not delete immediately)
6. Delete old version after 30-day grace period
```

---

## 13. Auto-Scaling Configuration

### 13.1 Scaling Tiers

| Phase | API Instances | DB Tier | Redis | Monthly Cost (est.) |
|:------|:------------|:--------|:------|:-------------------|
| **Year 1** (400 users) | 1 | B1 (Basic) | None | CHF 150-200 |
| **Year 2** (5,000 users) | 2 | S1 (Standard) | Basic | CHF 400-600 |
| **Year 3** (15,000 users) | 2-4 | S2 (Standard) | Standard | CHF 800-1,200 |
| **Year 5** (97,000 users) | 4-8 | P1 (Premium) | Premium | CHF 2,000-4,000 |

### 13.2 Auto-Scale Rules (Azure App Service)

| Metric | Scale Out | Scale In | Min/Max |
|:-------|:----------|:---------|:--------|
| CPU % | > 70% for 5 min | < 30% for 10 min | 2-8 instances |
| Memory % | > 80% for 5 min | < 40% for 10 min | 2-8 instances |
| HTTP Queue Length | > 100 for 3 min | < 10 for 10 min | 2-8 instances |
| Request Count | > 1000/min for 5 min | < 200/min for 10 min | 2-8 instances |

### 13.3 Database Scaling Strategy

```
Year 1: Azure Database for PostgreSQL - Flexible Server (Burstable B1ms)
  - 1 vCore, 2 GB RAM, 32 GB storage
  - Sufficient for 400 users, ~7 req/s

Year 3: Standard S2
  - 2 vCores, 8 GB RAM, 128 GB storage
  - Read replica for analytics/reporting
  - Connection pooler (PgBouncer)

Year 5: Premium P1
  - 4+ vCores, 16+ GB RAM, 512 GB storage
  - Multiple read replicas
  - High availability with zone redundancy
```

---

## 14. Deployment Environments

### 14.1 Environment Matrix

| Environment | URL | Database | Purpose | Deploy |
|:------------|:----|:---------|:--------|:-------|
| **Local** | localhost:5000 | SQLite | Individual dev | Manual |
| **Docker** | localhost:5000 | PostgreSQL (container) | Integration testing | docker-compose |
| **Staging** | staging-api.smartdispenser.ch | Azure PostgreSQL | Pre-production | Auto (main branch) |
| **Production** | api.smartdispenser.ch | Azure PostgreSQL | Live service | Manual approval |

### 14.2 Environment-Specific Configuration

| Setting | Local | Staging | Production |
|:--------|:------|:--------|:-----------|
| ASPNETCORE_ENVIRONMENT | Development | Staging | Production |
| Swagger | Enabled | Enabled (auth required) | Disabled |
| CORS | AllowAny | Staging frontend only | Production frontend only |
| Logging level | Debug | Information | Warning |
| Auto-migration | Enabled | Enabled | Manual only |
| Seed data | Demo users | Test users | None |
| SSL/TLS | None | Let's Encrypt | Managed certificate |

---

## 15. Disaster Recovery

### 15.1 Recovery Strategy

| Component | RTO | RPO | Strategy |
|:----------|:----|:----|:---------|
| API Service | 15 min | 0 (stateless) | Redeploy from container registry |
| Database | 1 hour | 5 min | Point-in-time restore (Azure managed) |
| Configuration | 5 min | 0 | Restore from Key Vault |
| DNS | 5 min | 0 | Azure Traffic Manager failover |

### 15.2 Disaster Recovery Procedure

```
1. ASSESS: Identify scope of failure (single service vs region)
2. COMMUNICATE: Notify stakeholders via status page
3. RECOVER:
   a. API: Redeploy from last known good image
   b. Database: Restore from Azure point-in-time backup
   c. Verify: Run health checks and smoke tests
4. VALIDATE: Confirm all services operational
5. POSTMORTEM: Document incident and remediation
```
