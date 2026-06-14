#!/bin/sh
set -eu

APP_URL="${GLOW_APP_URL:-http://localhost}"
KEYCLOAK_URL="${GLOW_KEYCLOAK_URL:-http://localhost/auth}"
KEYCLOAK_REALM="${GLOW_KEYCLOAK_REALM:-glow-realm}"
KEYCLOAK_CLIENT_ID="${GLOW_KEYCLOAK_CLIENT_ID:-glow-frontend}"
PATH_PREFIX="${GLOW_PATH_PREFIX:-}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__GLOW_CONFIG__ = {
  appUrl: "${APP_URL}",
  keycloakUrl: "${KEYCLOAK_URL}",
  keycloakRealm: "${KEYCLOAK_REALM}",
  keycloakClientId: "${KEYCLOAK_CLIENT_ID}",
  pathPrefix: "${PATH_PREFIX}"
};
EOF

exec nginx -g 'daemon off;'
