import { createContext, useEffect, useState } from 'react';
import keycloak from '../../app/keycloak.js';

export const AuthContext = createContext({
    initialized: false,
    isAuthenticated: false,
});

let keycloakInitPromise = null;

export function AuthProvider({ children }) {
    const [initialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(keycloak.authenticated));

    useEffect(() => {
        let cancelled = false;

        keycloak.onAuthSuccess = () => {
            if (!cancelled) setIsAuthenticated(true);
        };

        keycloak.onAuthLogout = () => {
            if (!cancelled) setIsAuthenticated(false);
        };

        if (!keycloakInitPromise) {
            keycloakInitPromise = keycloak.init({
                pkceMethod: 'S256',
                checkLoginIframe: false,
            });
        }

        keycloakInitPromise
            .then((authenticated) => {
                if (!cancelled) {
                    setIsAuthenticated(authenticated);
                    setInitialized(true);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setInitialized(true);
                    setIsAuthenticated(Boolean(keycloak.authenticated));
                }
            });

        return () => {
            cancelled = true;
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthLogout = undefined;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ initialized, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}