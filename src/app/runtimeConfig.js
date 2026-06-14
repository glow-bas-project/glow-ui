export function getRuntimeConfig() {
    if (typeof window === 'undefined' || !window.__GLOW_CONFIG__) {
        throw new Error(
            'Missing runtime config. Ensure /config.js is loaded before the application bundle.',
        );
    }

    return window.__GLOW_CONFIG__;
}

export function getAppRedirectUri(path = '/') {
    const { appUrl } = getRuntimeConfig();
    const base = appUrl.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
}

export function getRouterBasename() {
    const prefix = (getRuntimeConfig().pathPrefix || '').replace(/\/$/, '');
    return prefix || undefined;
}
