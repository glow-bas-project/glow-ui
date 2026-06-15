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

if [ -n "$PATH_PREFIX" ]; then
  # Vite builds use root-absolute paths; prefix them for Orbit (/alt-2026f01/* only).
  sed -i "s|src=\"/config.js\"|src=\"${PATH_PREFIX}/config.js\"|g" /usr/share/nginx/html/index.html
  sed -i "s|src=\"config.js\"|src=\"${PATH_PREFIX}/config.js\"|g" /usr/share/nginx/html/index.html
  sed -i "s|src=\"/assets/|src=\"${PATH_PREFIX}/assets/|g" /usr/share/nginx/html/index.html
  sed -i "s|href=\"/assets/|href=\"${PATH_PREFIX}/assets/|g" /usr/share/nginx/html/index.html
  sed -i "s|href=\"/favicon|href=\"${PATH_PREFIX}/favicon|g" /usr/share/nginx/html/index.html
fi

exec nginx -g 'daemon off;'
