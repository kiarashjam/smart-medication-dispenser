// Cheapest practical MVP: Linux App Service Basic B1 + PostgreSQL Flexible Burstable B1ms + Static Web Apps Free.
// WARNING: Postgres firewall allows all IPs for simplicity (dev/MVP). Lock down to App Service outbound IPs for production.

param location string = resourceGroup().location
param baseName string = 'smdmvp'

@secure()
param postgresAdminPassword string

@secure()
param jwtSecret string

param postgresAdminUser string = 'dispenseradmin'

var uniq = toLower(take(uniqueString(resourceGroup().id, baseName, deployment().name), 8))
var pgServerName = '${take(baseName, 8)}pg${uniq}'
var webAppName = '${baseName}-api-${uniq}'
var planName = '${baseName}-plan-${uniq}'
// Static Web App name: alphanumeric, 2-60 chars
var swaName = '${take(replace(baseName, '-', ''), 6)}web${uniq}'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  properties: {
    reserved: true
  }
}

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: pgServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
  }
}

resource pgDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: 'dispenser'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Dev/MVP only: allows access from anywhere. Replace with scoped rules + private link for production.
resource pgFw 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'AllowAllMvpDevOnly'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

var connString = 'Host=${postgres.properties.fullyQualifiedDomainName};Port=5432;Database=dispenser;Username=${postgresAdminUser};Password=${postgresAdminPassword};Ssl Mode=Require;Trust Server Certificate=true'

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        { name: 'ConnectionStrings__DefaultConnection', value: connString }
        { name: 'Jwt__SecretKey', value: jwtSecret }
        { name: 'Jwt__Issuer', value: 'SmartMedicationDispenser' }
        { name: 'Jwt__Audience', value: 'SmartMedicationDispenser' }
        { name: 'ASPNETCORE_ENVIRONMENT', value: 'Production' }
        { name: 'Mvp__Enabled', value: 'true' }
        { name: 'Mvp__Label', value: 'azure-mvp' }
        { name: 'Swagger__Enabled', value: 'true' }
        { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'false' }
      ]
    }
  }
  dependsOn: [
    pgDb
  ]
}

resource swa 'Microsoft.Web/staticSites@2022-03-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
  }
}

output webAppName string = webApp.name
output webAppHostName string = webApp.properties.defaultHostName
output apiHttpsUrl string = 'https://${webApp.properties.defaultHostName}'
output postgresServerFqdn string = postgres.properties.fullyQualifiedDomainName
output staticWebAppName string = swa.name
output staticWebAppHostname string = swa.properties.defaultHostname
