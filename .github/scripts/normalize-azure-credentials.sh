#!/usr/bin/env bash
# Normalizes service-principal JSON for azure/login@v3. Accepts:
# - GitHub/Azure format: clientId, clientSecret, subscriptionId, tenantId
# - Default az ad sp create-for-rbac JSON: appId, password, tenant (+ subscriptionId when using --scopes)
set -euo pipefail

if [ -z "${AZURE_CREDS:-}" ] || [ -z "${AZURE_CREDS// }" ]; then
  echo "::error::Repository secret AZURE_CREDENTIALS is not set or is empty."
  echo "Add it: GitHub repo → Settings → Secrets and variables → Actions → New repository secret."
  echo "Create JSON: az ad sp create-for-rbac ... --role contributor --scopes /subscriptions/<SUBSCRIPTION_ID> --json-auth"
  echo "See azure/README.md — Troubleshooting."
  exit 1
fi

# Strip UTF-8 BOM if present
if [[ "${AZURE_CREDS}" == $'\xEF\xBB\xBF'* ]]; then
  AZURE_CREDS="${AZURE_CREDS:3}"
fi

if ! NORMALIZED=$(echo "${AZURE_CREDS}" | jq -e -c '
  {
    clientId: (.clientId // .appId),
    clientSecret: (.clientSecret // .password),
    subscriptionId: (.subscriptionId // .subscription),
    tenantId: (.tenantId // .tenant)
  }
' 2>/dev/null); then
  echo "::error::AZURE_CREDENTIALS is not valid JSON or jq failed to parse it."
  echo "Paste the raw JSON only (no markdown fences). See azure/README.md — Troubleshooting."
  exit 1
fi

if ! echo "${NORMALIZED}" | jq -e '
  (.clientId | type == "string" and length > 0) and
  (.clientSecret | type == "string" and length > 0) and
  (.subscriptionId | type == "string" and length > 0) and
  (.tenantId | type == "string" and length > 0)
' >/dev/null 2>&1; then
  echo "::error::After normalizing (appId→clientId, password→clientSecret, tenant→tenantId), subscriptionId is still missing or empty."
  echo "Re-create the principal with a subscription scope, e.g.:"
  echo "  az ad sp create-for-rbac -n \"github-actions-...\" --role contributor --scopes /subscriptions/<SUBSCRIPTION_ID> --json-auth"
  echo "Or add \"subscriptionId\" to the JSON you paste into AZURE_CREDENTIALS."
  exit 1
fi

{
  echo 'creds<<__AZURE_LOGIN_CREDS_EOF__'
  echo "${NORMALIZED}"
  echo '__AZURE_LOGIN_CREDS_EOF__'
} >> "${GITHUB_OUTPUT}"
