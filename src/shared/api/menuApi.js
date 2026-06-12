import { menuApi } from './apiClients.js';

export const getMenuItemsByRestaurant = (restaurantId) =>
    menuApi.get(`/menu-items/restaurant/${restaurantId}`);