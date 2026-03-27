# Deploys the device simulator Azure Function (dotnet-isolated 8) and wires app settings to your Dispenser API.
# Requires: Azure CLI (az), dotnet 8 SDK. Optional: DISPENSER_API_BASE must be reachable from Azure (public URL).
param(
    [string] $ResourceGroupName = "rg-smd-device-simulator",
    [string] $Location = "switzerlandnorth",
    [string] $DispenserApiBase = "",
    [string] $DispenserDeviceId = "",
    [string] $DispenserApiKey = "",
    [string] $DispenserDeviceJwt = ""
)

$ErrorActionPreference = "Stop"
# PSScriptRoot = .../infrastructure/device-simulator → repo root is two levels up
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$proj = Join-Path $root "device-simulator-function\DeviceSimulatorFunction.csproj"
if (-not (Test-Path $proj)) { throw "Project not found: $proj" }

$funcName = "func-smd-sim-" + ([guid]::NewGuid().ToString("N").Substring(0, 10))
$storageName = ("st" + ([guid]::NewGuid().ToString("N").Substring(0, 21))).ToLowerInvariant()

Write-Host "Resource group: $ResourceGroupName"
Write-Host "Function app:   $funcName"
Write-Host "Storage:        $storageName"

az group create --name $ResourceGroupName --location $Location | Out-Null

az storage account create `
    --name $storageName `
    --location $Location `
    --resource-group $ResourceGroupName `
    --sku Standard_LRS | Out-Null

az functionapp create `
    --name $funcName `
    --resource-group $ResourceGroupName `
    --storage-account $storageName `
    --consumption-plan-location $Location `
    --runtime dotnet-isolated `
    --runtime-version 8 `
    --functions-version 4 `
    --os-type Windows | Out-Null

$settings = @(
    "FUNCTIONS_WORKER_RUNTIME=dotnet-isolated",
    "WEBSITE_RUN_FROM_PACKAGE=1"
)
if ($DispenserApiBase) { $settings += "DISPENSER_API_BASE=$DispenserApiBase" }
if ($DispenserDeviceId) { $settings += "DISPENSER_DEVICE_ID=$DispenserDeviceId" }
if ($DispenserApiKey) { $settings += "DISPENSER_X_API_KEY=$DispenserApiKey" }
if ($DispenserDeviceJwt) { $settings += "DISPENSER_DEVICE_JWT=$DispenserDeviceJwt" }

az functionapp config appsettings set `
    --name $funcName `
    --resource-group $ResourceGroupName `
    --settings $settings | Out-Null

$pub = Join-Path $env:TEMP "smd-sim-publish-$([guid]::NewGuid().ToString('N'))"
dotnet publish $proj -c Release -o $pub --verbosity quiet
if (-not (Test-Path $pub)) { throw "Publish failed" }

$zip = Join-Path $env:TEMP "smd-sim-$([guid]::NewGuid().ToString('N')).zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $pub "*") -DestinationPath $zip -Force

az functionapp deployment source config-zip `
    --resource-group $ResourceGroupName `
    --name $funcName `
    --src $zip | Out-Null

$hostDefault = az functionapp keys list --name $funcName --resource-group $ResourceGroupName --query "functionKeys.default" -o tsv 2>$null
$baseUrl = "https://$funcName.azurewebsites.net"

Write-Host ""
Write-Host "=== Deployed ===" -ForegroundColor Green
Write-Host "Function app URL: $baseUrl"
Write-Host "Simulate (GET):   $baseUrl/api/device/simulate?code=$hostDefault"
Write-Host "Register (GET):   $baseUrl/api/device/register?code=$hostDefault"
Write-Host ""
Write-Host "Set DISPENSER_API_BASE to a public HTTPS URL of your API (App Service / container). localhost will NOT work from Azure."
Write-Host "Then set DISPENSER_DEVICE_ID (36-char GUID from JWT nameidentifier) and either DISPENSER_X_API_KEY (portal) or DISPENSER_DEVICE_JWT (full token from POST /api/v1/devices/register)."
Write-Host "Azure CLI tip: JWT values break on '=' — use a file: create token.txt then run:"
Write-Host "  az functionapp config appsettings set -g $ResourceGroupName -n $funcName --settings DISPENSER_DEVICE_JWT@token.txt DISPENSER_DEVICE_ID=<guid>"
