# Swagger / OpenAPI (API reference)

The **ASP.NET Core** host uses **Swashbuckle.AspNetCore** to expose:

| URL | Purpose |
|-----|---------|
| `/swagger` | **Swagger UI** — try requests, schemas, auth |
| `/swagger/v1/swagger.json` | **OpenAPI 3** document (import into Postman, codegen, etc.) |

## When it is enabled

- **Development** (`ASPNETCORE_ENVIRONMENT=Development`): Swagger is **always** on (local `dotnet run`, typical Docker dev).
- **Other environments**: off by default. Set **`Swagger:Enabled`** to `true` in configuration (or env `Swagger__Enabled=true`) only if you intentionally want interactive docs in staging/demo. **Do not** expose Swagger on a public production API without network restrictions.

Configuration lives in `backend/src/Api/appsettings.json` under `"Swagger"`.

## Using JWT in Swagger UI

1. Call **POST /api/auth/login** with demo credentials (see `backend/README.md`).
2. Copy the **token** from the response.
3. Click **Authorize** (lock), choose **Bearer**, paste **only the token** (Swagger adds the `Bearer ` prefix for `Authorization`).

Endpoints that require `[Authorize]` show a lock icon; anonymous routes (health, auth login/register, selected device routes) do not.

## Device API (`X-API-Key`)

Hardware routes under **`/api/v1/...`** often expect header **`X-API-Key`**. Swagger UI does not define a global scheme for that key: add the header manually under a request’s **Parameters** or use **curl**/Postman. See `WEBHOOKS_JSON_REFERENCE.md` and `02_BACKEND_API.md`.

## Where descriptions come from

- **API overview** (intro text, links): `backend/src/Api/Configuration/SwaggerExtensions.cs` (`OpenApiInfo.Description`).
- **Per-controller / per-action** text: XML `///` comments on controllers and actions in `backend/src/Api`.
- The Api project sets **`GenerateDocumentationFile`** so those comments are compiled into `Api.xml` and picked up by `IncludeXmlComments`.

## Implementation files

| File | Role |
|------|------|
| `Api/Configuration/SwaggerExtensions.cs` | `AddSmartDispenserSwagger()`, `UseSmartDispenserSwaggerUi()` |
| `Api/Configuration/SwaggerSecurityRequirementsOperationFilter.cs` | Attach Bearer security only to authenticated operations |
| `Api/Program.cs` | Registers Swagger; enables UI when Development or `Swagger:Enabled` |

## Packages

- **Swashbuckle.AspNetCore** — OpenAPI generation + UI (`Microsoft.AspNetCore.OpenApi` is also referenced for standard OpenAPI types; controllers are the primary surface).
