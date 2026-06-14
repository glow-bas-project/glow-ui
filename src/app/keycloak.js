import Keycloak from 'keycloak-js';
import { getRuntimeConfig } from './runtimeConfig.js';

let keycloakInstance = null;

export function getKeycloak() {
    if (!keycloakInstance) {
        const { keycloakUrl, keycloakRealm, keycloakClientId } = getRuntimeConfig();

        if (!keycloakUrl || !keycloakRealm || !keycloakClientId) {
            throw new Error('Incomplete Keycloak runtime config. Check /config.js.');
        }

        keycloakInstance = new Keycloak({
            url: keycloakUrl,
            realm: keycloakRealm,
            clientId: keycloakClientId,
        });
    }

    return keycloakInstance;
}

export default getKeycloak();
