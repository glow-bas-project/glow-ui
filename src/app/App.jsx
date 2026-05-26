import { useEffect, useState } from 'react';
import keycloak from './keycloak.js';
import api from '../shared/api/axiosInstance.js';


const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
const adminConsoleRedirectUri = `${keycloakUrl}/admin/${keycloakRealm}/console/`;

let keycloakInitPromise = null;

function App() {
    const [initialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(keycloak.authenticated));

    useEffect(() => {
        let cancelled = false;

        keycloak.onAuthSuccess = () => {
            if (!cancelled) {
                setIsAuthenticated(true);
            }
        };

        keycloak.onAuthLogout = () => {
            if (!cancelled) {
                setIsAuthenticated(false);
            }
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

    useEffect(() => {
        if (!initialized || !isAuthenticated) {
            return undefined;
        }

        const syncProfile = async () => {
            try {
                await api.post('/sync-profile', {});
            } catch {
                // ignore — backend may not be available in all dev setups
            }
        };

        syncProfile();
    }, [initialized, isAuthenticated]);

    const handleSignIn = () => {
        keycloak.login({
            redirectUri: adminConsoleRedirectUri,
        });
    };

    const handleSignOut = () => {
        keycloak.logout({
            redirectUri: window.location.origin,
        });
    };

    return (
        <main>
            <section>
                <h1>Glow</h1>
                <p>Frontend bootstrap for Glow.</p>
                <p>
                    {initialized
                        ? isAuthenticated
                            ? `Signed in as ${keycloak.tokenParsed?.preferred_username ?? 'user'}`
                            : 'Authentication initialised. Sign in to continue.'
                        : 'Initialising authentication...'}
                </p>
                <div>
                    {isAuthenticated ? (
                        <button type="button" onClick={handleSignOut}>
                            Sign out
                        </button>
                    ) : (
                        <button type="button" style={{ backgroundColor: 'orange', color: 'white' }} onClick={handleSignIn} disabled={!initialized}>
                            Sign in
                        </button>
                    )}
                </div>
            </section>
        </main>
    )
}

export default App
