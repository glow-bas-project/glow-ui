# GLOW end-to-end tests (Playwright)

## Tags

Tests use title tags parsed by Playwright `--grep`:

| Tag | When CI runs it |
|-----|-----------------|
| `@smoke` | Every production deploy |
| `@service:<name>` | Deploy of that service only |
| `@regression` | Manual / full-suite runs (not CI deploy by default) |

### Service names

| Tag | K8s Deployment | Repo |
|-----|----------------|------|
| `@service:ui` | `glow-ui` | glow-ui |
| `@service:restaurant` | `glow-restaurant` | glow-restaurant-service |
| `@service:user` | `glow-user` | glow-user-service |
| `@service:order` | `glow-order` | glow-order-service |
| `@service:cart` | `glow-cart` | glow-cart-service |
| `@service:courier` | `glow-courier` | glow-courier-service |
| `@service:menu` | `glow-menu` | glow-menu-service |
| `@service:payment` | `glow-payment` | glow-payment-service |

## CI command

After a service deploy, GitLab CI runs:

```bash
npx playwright test --grep "@smoke|@service:<deployed_service>"
```

Example after `restaurant` deploy: `@smoke|@service:restaurant`.

## Local runs

```bash
export BASE_URL=https://project.orbit.au.dk/alt-2026f01   # or local k3d URL
npm ci
npm run test:e2e:smoke
npx playwright test --grep "@smoke|@service:restaurant"
```

## Writing tests

```javascript
test('order flow @smoke @service:order', async ({ page }) => {
  // ...
});
```

Use at least `@smoke` or `@service:<name>` on every deploy-gated test.
