import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantApi } from '../../shared/api/apiClients.js';
import keycloak from '../../app/keycloak.js';
import { useRoles } from '../../shared/auth/useRoles.js';

function RestaurantDashboardPage() {
    const navigate = useNavigate();
    const { isRestaurantUser } = useRoles();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isRestaurantUser) {
            navigate('/');
            return;
        }
        restaurantApi.get('/restaurants')
            .then(res => setRestaurants(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isRestaurantUser, navigate]);

    if (loading) return <main className="app-shell"><div className="app-shell__inner"><div className="app-state app-state--loading">Loading...</div></div></main>;

    return (
        <main className="app-shell">
            <div className="app-shell__inner">
                <header className="app-header">
                    <div className="app-brand">
                        <div className="app-brand__mark">G</div>
                        <div className="app-brand__copy">
                            <p className="app-brand__eyebrow">Glow</p>
                            <h1 className="app-brand__title">Select your restaurant</h1>
                        </div>
                    </div>
                </header>
                <section className="app-search-panel">
                    <div className="restaurant-grid">
                        {restaurants.map(r => (
                            <article
                                key={r.id}
                                className="restaurant-card"
                                onClick={() => navigate(`/restaurants/${r.id}/orders`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="restaurant-card__content">
                                    <div className="restaurant-card__heading">
                                        <h2 className="restaurant-card__title">{r.name}</h2>
                                        <p className="restaurant-card__location">{r.address?.city}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default RestaurantDashboardPage;