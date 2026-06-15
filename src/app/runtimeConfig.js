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

export function getPathPrefix() {
    return (getRuntimeConfig().pathPrefix || '').replace(/\/$/, '');
}

export function getRouterBasename() {
    const prefix = getPathPrefix();
    return prefix || undefined;
}

/** Prefix root-absolute paths with Orbit pathPrefix (empty locally). */
export function resolveAppPath(path) {
    const prefix = getPathPrefix();
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return prefix ? `${prefix}${normalized}` : normalized;
}
