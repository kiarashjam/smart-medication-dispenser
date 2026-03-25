# Smart Medication Dispenser – Backend

**MVP scope:** [../software-docs/MVP_APPLICATION.md](../software-docs/MVP_APPLICATION.md)

ASP.NET Core 8 Web API with Clean Architecture: Domain, Application, Infrastructure, Api.

## Projects

- **Domain** – Entities, enums
- **Application** – DTOs, interfaces, MediatR handlers, FluentValidation
- **Infrastructure** – EF Core (PostgreSQL), repositories, JWT auth, background job (missed dose + low stock)
- **Api** – Controllers, Swagger, JWT middleware

## Run locally

1. **PostgreSQL**  
   Start PostgreSQL (e.g. Docker: `docker run -d -p 5432:5432 -e POSTGRES_USER=dispenser -e POSTGRES_PASSWORD=dispenser_secret -e POSTGRES_DB=dispenser postgres:15-alpine`).

2. **Connection string**  
   Set in `src/Api/appsettings.Development.json` or env:
   - `ConnectionStrings__DefaultConnection`

3. **Migrations**
   ```bash
   cd backend
   dotnet ef database update --project src/Infrastructure --startup-project src/Api
   ```

4. **Run API**
   ```bash
   dotnet run --project src/Api
   ```
   - API: http://localhost:5000  
   - Swagger: http://localhost:5000/swagger  

**MVP mode:** `appsettings.json` → `Mvp:Enabled` / `Mvp:Label`. `GET /health` returns `mvp` and `mvpLabel` for clients.

## Demo credentials (seed)

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Patient  | patient@demo.com   | Demo123!   |
| Caregiver| caregiver@demo.com | Demo123!   |
| Admin    | admin@demo.com     | Demo123!   |

Seed creates: one patient, one caregiver, one admin; main + portable device for patient; two containers and two schedules on the main device.

## Tests

```bash
dotnet test
```

## JWT

Configure in appsettings or env:

- `Jwt__SecretKey` – at least 32 characters  
- `Jwt__Issuer` / `Jwt__Audience` – optional  

Bearer token is required for all endpoints except `POST /api/auth/register` and `POST /api/auth/login`.
