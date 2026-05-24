import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './app/keycloak.js';
import App from './app/App.jsx';

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
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ReactKeycloakProvider>
	</StrictMode>,
)