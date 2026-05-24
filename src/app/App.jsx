import { useKeycloak } from '@react-keycloak/web';

function App() {
    const { keycloak, initialized } = useKeycloak();
    const isAuthenticated = Boolean(keycloak?.authenticated);

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
                        <button type="button" onClick={() => keycloak.logout()}>
                            Sign out
                        </button>
                    ) : (
                        <button type="button" onClick={() => keycloak.login()} disabled={!initialized}>
                            Sign in
                        </button>
                    )}
                </div>
            </section>
        </main>
    )
}

export default App
