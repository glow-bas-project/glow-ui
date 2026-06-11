import axios from 'axios';
import keycloak from '../../app/keycloak.js';

function withAuth(client) {
    client.interceptors.request.use((config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    });
    return client;
}

export const restaurantApi = withAuth(axios.create({ baseURL: '/api/restaurant' }));
export const userApi = withAuth(axios.create({ baseURL: '/api/user' }));
export const cartApi = withAuth(axios.create({ baseURL: '/api/cart' }));
