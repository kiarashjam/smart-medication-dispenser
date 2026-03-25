# Azure MVP (cheapest practical stack)

I do not have access to your Azure subscription. These files **define** infrastructure and CI/CD; **you** run them with your account.

## What gets created (one resource group)

| Resource | SKU / tier | Notes |
|----------|------------|--------|
| **Resource group** | — | Name you choose (default `rg-smart-dispenser-mvp`) |
| **App Service plan** | **B1** (Linux) | Cheapest paid plan that fits this API well |
| **Web App** | .NET 8 runtime | Hosts the ASP.NET Core API |
| **PostgreSQL Flexible Server** | **Burstable B1ms** + 32 GB | Smallest generally available tier |
| **Database** | `dispenser` | Created on the server |
| **Static Web App** | **Free** | Hosts the Vite build |

**Cost:** varies by region and currency; expect **on the order of tens of USD/month** (App Service B1 + PostgreSQL B1ms are the main items). There is no “free” PostgreSQL on Azure for this pattern.

**Security warning:** the Bicep template opens PostgreSQL firewall to **0.0.0.0–255.255.255.255** for MVP simplicity. **Tighten this before production** (scoped IPs or private endpoint).

## Prerequisites

1. Azure subscription.
2. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (`az`) locally **or** use GitHub Actions only.
3. A **service principal** for GitHub Actions:

```bash
az login
az ad sp create-for-rbac \
  --name "github-actions-smart-dispenser" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth
```

Copy the JSON output into GitHub secret **`AZURE_CREDENTIALS`**.

4. GitHub repository secrets:

| Secret | Purpose |
|--------|---------|
| `AZURE_CREDENTIALS` | Output of `create-for-rbac` |
| `AZURE_POSTGRES_ADMIN_PASSWORD` | Strong password (8+ chars, complexity) for PostgreSQL admin |
| `AZURE_JWT_SECRET` | Random string **≥ 32 characters** (JWT signing) |

After the **infra** workflow finishes, add:

| Secret | Value |
|--------|--------|
| `AZURE_RESOURCE_GROUP` | Same as workflow input, e.g. `rg-smart-dispenser-mvp` |
| `AZURE_WEBAPP_NAME` | From deployment output `webAppName` |
| `VITE_API_URL` | From output `apiHttpsUrl` (e.g. `https://smdmvp-api-xxxxx.azurewebsites.net`, **no** trailing slash) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Portal → Static Web App → **Manage deployment token** |

## Option A — Provision from GitHub Actions

1. Add the secrets above (except SWA token can wait until after first deploy).
2. Run workflow **“Azure — provision infrastructure”** (`azure-infra.yml`) manually.
3. Open the job summary: copy outputs into secrets.
4. Get the Static Web Apps deployment token from the Azure Portal.
5. Run **“Azure — deploy apps”** (`azure-deploy-apps.yml`) manually.

## Option B — Provision locally

```bash
cd azure
az login
# Build parameters (replace passwords — do not commit this file)
jq -n \
  --arg loc "westeurope" \
  --arg rg "rg-smart-dispenser-mvp" \
  --arg base "smdmvp" \
  --arg pg "YOUR_POSTGRES_PASSWORD" \
  --arg jwt "YOUR_LONG_RANDOM_JWT_SECRET_AT_LEAST_32_CHARS" \
  '{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentParameters.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "location": { "value": $loc },
      "resourceGroupName": { "value": $rg },
      "baseName": { "value": $base },
      "postgresAdminPassword": { "value": $pg },
      "jwtSecret": { "value": $jwt }
    }
  }' > deployment-params.json

az deployment sub create \
  --name "smd-mvp-local" \
  --location westeurope \
  --template-file main.bicep \
  --parameters @deployment-params.json

rm deployment-params.json
```

## Mobile app

Point `EXPO_PUBLIC_API_URL` at the same **`VITE_API_URL`** value (your API HTTPS URL).

## Files

- `main.bicep` — subscription deployment (creates resource group + module).
- `resources.bicep` — App Service, PostgreSQL, Static Web App.
