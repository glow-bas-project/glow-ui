# React + Vite

This is a React + Vite front-end for Glow UI.

## Glow UI Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and adjust if needed.
3. Start the compose stack from `glow-devops` (Traefik on port 80) so `/api/*` and `/auth` are available.
4. Start the UI dev server with `npm run dev` and open `http://localhost:5173/` in your browser.

The Vite dev server proxies `/api` and `/auth` to `http://localhost` (Traefik). API calls use fixed paths such as `/api/restaurant` and `/api/user` — the same layout as the production compose stack.

### Environment variables

| Variable | Compose / production build | Local `npm run dev` |
|----------|---------------------------|---------------------|
| `VITE_APP_URL` | `http://localhost` | `http://localhost:5173` (Keycloak redirect URIs) |
| `VITE_KEYCLOAK_URL` | `http://localhost/auth` | `http://localhost/auth` (via proxy) |
| `VITE_KEYCLOAK_REALM` | `glow-realm` | `glow-realm` |
| `VITE_KEYCLOAK_CLIENT_ID` | `glow-frontend` | `glow-frontend` |

### Restaurant-only backend (optional)

To hit a single Quarkus dev instance (`./gradlew quarkusDev` on port 8085) without the full stack, you would need a custom Vite proxy rewrite for `/api/restaurant` only. The supported local setup is the `glow-devops` compose stack with Traefik.

## Production image

Build with Keycloak and app URL baked in (see `src/main/docker/Dockerfile.prod` and `.gitlab-ci.yml`):

```bash
docker build -f src/main/docker/Dockerfile.prod \
  --build-arg VITE_APP_URL=http://localhost \
  --build-arg VITE_KEYCLOAK_URL=http://localhost/auth \
  --build-arg VITE_KEYCLOAK_REALM=glow-realm \
  --build-arg VITE_KEYCLOAK_CLIENT_ID=glow-frontend \
  -t glow-ui .
```

The image serves the SPA at `/` behind Traefik’s catch-all route on `GLOW_EDGE_HOST`.

GitLab CI publishes a multi-arch manifest (`linux/amd64`, `linux/arm64`) via `docker buildx`, matching the Java service pipelines in `glow-devops`.
