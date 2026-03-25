# GitHub Actions workflows

| File | Workflow name (Actions tab) | When it runs | What it does |
|------|---------------------------|--------------|--------------|
| [`ci-backend-tests-web-build.yml`](ci-backend-tests-web-build.yml) | **CI — backend tests & web build** | Every **push** and **pull request** to `main` or `master` | **Job 1 — Backend:** checkout → .NET 8 → `dotnet restore` → `dotnet build -c Release` → `dotnet test -c Release`. **Job 2 — Web:** checkout → Node 20 → `npm ci` → `npm run build`. Jobs run in parallel. |
| [`azure-provision-infrastructure.yml`](azure-provision-infrastructure.yml) | **Azure — provision infrastructure (Bicep)** | **Manual** (`workflow_dispatch`) | Login with `AZURE_CREDENTIALS` → build `deployment-params.json` from inputs + secrets → `az deployment sub create` using `azure/main.bicep` → writes outputs and secret checklist to the job summary. |
| [`azure-deploy-api-static-web.yml`](azure-deploy-api-static-web.yml) | **Azure — deploy API & static web** | **Push** to `main`/`master` when `backend/**`, `web/**`, or this workflow file changes; plus **manual** (`workflow_dispatch`). Overlapping runs cancel (`concurrency`). | **API job:** publish API → zip → `az webapp deploy` to App Service. **Web job** (after API succeeds): `npm ci` + `npm run build` with `VITE_API_URL` + `VITE_MVP_MODE` → upload `web/dist` to Static Web Apps. |

**Dependabot** is configured in [`.github/dependabot.yml`](../dependabot.yml) (fixed filename; do not rename). It opens weekly PRs for GitHub Actions, `web` npm, and `mobile` npm.

**Docker Compose** for local stacks is [`docker-compose.yml`](../../docker-compose.yml) at the repo root (standard name for `docker compose`).
