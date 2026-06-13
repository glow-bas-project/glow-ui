import keycloak from '../../app/keycloak.js';

export function useRoles() {
    const token = keycloak.tokenParsed;
    const realmRoles = token?.realm_access?.roles ?? [];
    const isRestaurantUser = realmRoles.includes('RESTAURANT_USER');
    const isCustomer = realmRoles.includes('CUSTOMER') || (!isRestaurantUser);
    const restaurantId = token?.restaurantId ?? null;
    return { isRestaurantUser, isCustomer, restaurantId, realmRoles };
}