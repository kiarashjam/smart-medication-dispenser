// Subscription-scoped deployment: creates resource group + MVP stack (see resources.bicep).

targetScope = 'subscription'

@description('Azure region (use same region for all resources; SWA Free supports limited regions).')
param location string = 'westeurope'

@description('Resource group name for all MVP resources.')
param resourceGroupName string = 'rg-smart-dispenser-mvp'

@description('Short prefix for resource names (letters/numbers, keep short).')
param baseName string = 'smdmvp'

@secure()
@minLength(8)
@description('PostgreSQL admin password (complex password required by Azure).')
param postgresAdminPassword string

@secure()
@minLength(32)
@description('JWT signing secret (at least 32 characters).')
param jwtSecret string

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

module stack 'resources.bicep' = {
  name: 'stack-${baseName}'
  scope: rg
  params: {
    location: location
    baseName: baseName
    postgresAdminPassword: postgresAdminPassword
    jwtSecret: jwtSecret
  }
}

output resourceGroupName string = rg.name
output webAppName string = stack.outputs.webAppName
output apiHttpsUrl string = stack.outputs.apiHttpsUrl
output staticWebAppName string = stack.outputs.staticWebAppName
output staticWebAppHostname string = stack.outputs.staticWebAppHostname
