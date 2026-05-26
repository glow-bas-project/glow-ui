# React + Vite

This is a React + Vite front-end template for Glow UI. It is based on the official Vite React template, with some modifications to fit the needs of the project.

## Glow UI Setup

1. Install dependencies with `npm install`.
2. Create your local environment file by copying `.env.example` to `.env` and filling in the values for Vite and Keycloak.
3. Start the dev server with `npm run dev`.
4. Build for production with `npm run build`.
5. Run linting with `npm run lint`.

## React Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
