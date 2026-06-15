import axios from 'axios';
import keycloak from '../../app/keycloak.js';
import { resolveAppPath } from '../../app/runtimeConfig.js';

function withAuth(client) {
    client.interceptors.request.use((config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    });
    return client;
}

export const restaurantApi = withAuth(axios.create({ baseURL: resolveAppPath('/api/restaurant') }));
export const userApi = withAuth(axios.create({ baseURL: resolveAppPath('/api/user') }));
export const cartApi = withAuth(axios.create({ baseURL: resolveAppPath('/api/cart') }));
export const menuApi = withAuth(axios.create({ baseURL: resolveAppPath('/api/menu') }));
export const orderApi = withAuth(axios.create({ baseURL: resolveAppPath('/api/order') }));
