import { useState, useEffect } from 'react';
import { getRestaurantById } from '../../../shared/api/restaurantsApi.js';
import { getMenuItemsByRestaurant } from '../../../shared/api/menuApi.js';

export function useRestaurantDetails(restaurantId) {
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!restaurantId) return;

        let isActive = true;
        setError(null);

        Promise.all([
            getRestaurantById(restaurantId),
            getMenuItemsByRestaurant(restaurantId),
        ])
            .then(([restaurantRes, menuItemsRes]) => {
                if (isActive) {
                    setRestaurant(restaurantRes.data);
                    setMenuItems(menuItemsRes.data);
                }
            })
            .catch((err) => {
                if (isActive) setError(err);
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [restaurantId]);

    return { restaurant, menuItems, loading, error };
}