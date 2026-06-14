// Dev defaults (Vite serves this from public/). Production containers overwrite via entrypoint.
window.__GLOW_CONFIG__ = {
    appUrl: 'http://localhost:5173',
    keycloakUrl: 'http://localhost/auth',
    keycloakRealm: 'glow-realm',
    keycloakClientId: 'glow-frontend',
    pathPrefix: '',
};
