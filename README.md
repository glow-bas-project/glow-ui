# React + Vite

This is a React + Vite front-end for Glow UI.

## Glow UI Setup

1. Install dependencies with `npm install`.
2. Adjust `public/config.js` if your local URLs differ (defaults target `npm run dev` on port 5173).
3. Start the compose stack from `glow-devops` (Traefik on port 80) so `/api/*` and `/auth` are available.
4. Start the UI dev server with `npm run dev` and open `http://localhost:5173/` in your browser.

The Vite dev server proxies `/api` and `/auth` to `http://localhost` (Traefik). API calls use relative paths such as `/api/restaurant` and `/api/user`.

### Runtime configuration (not build-time)

The SPA loads `/config.js` before the bundle. Keycloak and redirect URIs come from `window.__GLOW_CONFIG__`.

| Variable | Purpose | Compose example | k3d local example |
|----------|---------|-----------------|-------------------|
| `GLOW_APP_URL` | Public UI origin (redirect URIs) | `http://localhost` | `http://localhost:8880` |
| `GLOW_KEYCLOAK_URL` | Keycloak base URL | `http://localhost/auth` | `http://localhost:8880/auth` |
| `GLOW_KEYCLOAK_REALM` | Realm name | `glow-realm` | `glow-realm` |
| `GLOW_KEYCLOAK_CLIENT_ID` | Public OIDC client | `glow-frontend` | `glow-frontend` |
| `GLOW_PATH_PREFIX` | Router basename | `""` | `""` (staging: `/staging`) |

**Local `npm run dev`:** edit `public/config.js` (no container env vars).

**Docker / Kubernetes:** set `GLOW_*` on the `glow-ui` container. Helm maps them from `global.publicOrigin`, `global.authBaseUrl`, and `global.pathPrefix` in `glow-devops`.

One registry image works for all environments — no per-env `docker build` for URLs.

### Restaurant-only backend (optional)

To hit a single Quarkus dev instance (`./gradlew quarkusDev` on port 8085) without the full stack, you would need a custom Vite proxy rewrite for `/api/restaurant` only. The supported local setup is the `glow-devops` compose stack with Traefik.

## Production image

```bash
docker build -f src/main/docker/Dockerfile.prod -t glow-ui .
docker run --rm -p 8080:80 \
  -e GLOW_APP_URL=http://localhost \
  -e GLOW_KEYCLOAK_URL=http://localhost/auth \
  glow-ui
```

GitLab CI publishes a multi-arch manifest (`linux/amd64`, `linux/arm64`) via `docker buildx`.
