import { useEffect, useState } from 'react';
import keycloak from './keycloak.js';
import api from '../shared/api/axiosInstance.js';

const initialProfileState = {
    status: 'idle',
    message: '',
};

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
const adminConsoleRedirectUri = `${keycloakUrl}/admin/${keycloakRealm}/console/`;

let keycloakInitPromise = null;

function App() {
    const [initialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(keycloak.authenticated));
    const [profileState, setProfileState] = useState(initialProfileState);
    const displayName = keycloak?.tokenParsed?.preferred_username
        ?? keycloak?.tokenParsed?.email
        ?? 'user';

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
            setProfileState(initialProfileState);
            return undefined;
        }

        let cancelled = false;

        const syncProfile = async () => {
            setProfileState({
                status: 'syncing',
                message: 'Syncing user profile with glow-user-service...',
            });

            try {
                await api.post('/sync-profile', {});

                if (!cancelled) {
                    setProfileState({
                        status: 'ready',
                        message: 'Signed in and user profile is ready.',
                    });
                }
            } catch {
                if (!cancelled) {
                    setProfileState({
                        status: 'error',
                        message: 'Signed in to Keycloak, but the user profile sync is not available yet.',
                    });
                }
            }
        };

        syncProfile();

        return () => {
            cancelled = true;
        };
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
