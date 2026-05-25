import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './app/keycloak.js';
import App from './app/App.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={{
                onLoad: 'check-sso',
                pkceMethod: 'S256',
            }}
        >
            <App />
        </ReactKeycloakProvider>
    </StrictMode>,
)