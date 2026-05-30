# React + Vite

This is a React + Vite front-end template for Glow UI. It is based on the official Vite React template, with some modifications to fit the needs of the project.

## Glow UI Setup

1. Install dependencies with `npm install`.
2. Create your local environment file by copying `.env.example` to `.env` and fill up the values.
   1. `VITE_API_BASE_URL` should point to the restaurant service backend, e.g. `http://localhost:8085` for local development or the Traefik route if using the compose stack.
   2. The Keycloak variables are only needed if you want to test authentication locally with a local Keycloak instance. If you are using the compose stack, the UI will be able to authenticate with the Keycloak service in the stack without any additional configuration.
3. Start the restaurant backend locally with `./gradlew quarkusDev` in `glow-restaurant-service`.
4. Start the UI dev server with `npm run dev` and open `http://localhost:5173/ui` in your browser.

### Local restaurant data

The restaurant service seeds one dev restaurant automatically at startup, so once the backend is running on port `8085`, the UI should render a live restaurant list instead of the fetch error.

If you use the compose stack instead of a local backend, point `VITE_API_BASE_URL` at the Traefik route for the service rather than `localhost:8085`.

## React Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
