import { useState, useEffect } from 'react';
import { getRestaurants, searchRestaurants } from '../../../shared/api/restaurantsApi.js';

export function useRestaurants(searchTerm = '') {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isActive = true;

        const beginRequest = async () => {
            await Promise.resolve();

            if (isActive) {
                setLoading(true);
                setError(null);
            }
        };

        beginRequest();

        const request = searchTerm.trim() ? searchRestaurants(searchTerm.trim()) : getRestaurants();

        request
            .then((res) => {
                if (isActive) {
                    setRestaurants(res.data);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(err);
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [searchTerm]);

    return { restaurants, loading, error };
}