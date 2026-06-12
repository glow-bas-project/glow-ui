import { useCallback, useEffect, useState } from 'react';
import { cartApi } from '../api/apiClients.js';

export function useCartSummary(isReady) {
    const [itemCount, setItemCount] = useState(0);

    const refresh = useCallback(async () => {
        if (!isReady) return;

        try {
            const response = await cartApi.get('/carts/me');
            const totalItems = response.data.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            setItemCount(totalItems);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    }, [isReady]);

    useEffect(() => {
        if (!isReady) return;

        (async () => {
            try {
                const response = await cartApi.get('/carts/me');
                const totalItems = response.data.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                setItemCount(totalItems);
            } catch (error) {
                console.error('Failed to fetch cart:', error);
            }
        })();
    }, [isReady]);

    return { itemCount: isReady ? itemCount : 0, refresh };
}