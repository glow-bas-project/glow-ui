import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import keycloak from '../../app/keycloak.js';
import { cartApi } from '../../shared/api/apiClients.js';
import { useAuth } from '../../shared/auth/useAuth.js';
import { useCartSummary } from '../../shared/hooks/useCartSummary.js';
import { useRestaurantDetails } from './hooks/useRestaurantDetails.js';

function formatTime(time) {
    return typeof time === 'string' ? time.slice(0, 5) : time;
}

function OpeningHours({ openingHours }) {
    const days = openingHours?.dailyOpeningHours ?? [];

    if (days.length === 0) {
        return null;
    }

    return (
        <ul className="restaurant-card__tags" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
            {days.map((day) => (
                <li key={day.dayOfWeek}>
                    <strong>{day.dayOfWeek}: </strong>
                    {day.closed || !day.timeRanges?.length
                        ? 'Closed'
                        : day.timeRanges
                            .map((range) => `${formatTime(range.open)}–${formatTime(range.close)}`)
                            .join(', ')}
                </li>
            ))}
        </ul>
    );
}

function MenuItemCard({ item, onAddToCart, addingId }) {
    const isAdding = addingId === item.id;

    return (
        <article className="restaurant-card">
            <div className="restaurant-card__content">
                <div className="restaurant-card__heading">
                    <h2 className="restaurant-card__title">{item.name}</h2>
                    <p className="restaurant-card__location">{item.description}</p>
                </div>

                <div className="restaurant-card__tags">
                    <span className="restaurant-card__tag">{item.category}</span>
                    <span className="restaurant-card__tag">{item.price} kr</span>
                </div>

                {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                    <p className="restaurant-card__location">
                        {item.ingredients.join(', ')}
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    disabled={isAdding}
                    className="app-auth-button app-auth-button--primary"
                    style={{ marginTop: '0.75rem' }}
                >
                    {isAdding ? 'Adding...' : 'Add to cart'}
                </button>
            </div>
        </article>
    );
}

function RestaurantDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { initialized, isAuthenticated } = useAuth();
    const { restaurant, menuItems, loading, error } = useRestaurantDetails(id);
    const { itemCount: cartItemCount, refresh: refreshCart } = useCartSummary(initialized && isAuthenticated);
    const [addingId, setAddingId] = useState(null);
    const [cartMessage, setCartMessage] = useState(null);

    const handleAddToCart = async (item) => {
        if (!initialized) {
            return;
        }

        if (!isAuthenticated) {
            keycloak.login({ redirectUri: window.location.href });
            return;
        }

        setAddingId(item.id);
        setCartMessage(null);

        try {
            await cartApi.post('carts/me/items', {
                menuItemId: item.id,
                name: item.name,
                quantity: 1,
                price: item.price,
            });
            setCartMessage(`${item.name} added to cart.`);
            refreshCart();
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            setCartMessage('Could not add item to cart.');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <main className="app-shell">
            <div className="app-shell__inner">
                <header className="app-header">
                    <div className="app-brand">
                        <div className="app-brand__mark">G</div>
                        <div className="app-brand__copy">
                            <p className="app-brand__eyebrow">Glow</p>
                            <h1 className="app-brand__title">
                                {restaurant?.name ?? 'Restaurant'}
                            </h1>
                        </div>
                    </div>
                    <div className="app-header__actions">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="app-auth-button app-auth-button--secondary"
                        >
                            Back to restaurants
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/cart')}
                            className="app-auth-button app-auth-button--secondary"
                        >
                            Cart ({cartItemCount})
                        </button>
                    </div>
                </header>

                <section className="app-search-panel">
                    {loading && (
                        <div className="app-state app-state--loading">Loading restaurant...</div>
                    )}

                    {error && (
                        <div className="app-state app-state--error">
                            Could not load this restaurant.
                        </div>
                    )}

                    {!loading && !error && restaurant && (
                        <>
                            <div className="app-search-panel__intro">
                                <p className="app-section-kicker">
                                    {restaurant.address?.city ?? ''}
                                </p>
                                <h2 className="app-section-title">{restaurant.name}</h2>
                                <p className="app-section-copy">
                                    {restaurant.address?.address}, {restaurant.address?.city}, {restaurant.address?.country}
                                </p>
                                <p className="app-section-copy">{restaurant.phoneNumber}</p>
                                <OpeningHours openingHours={restaurant.openingHours} />
                            </div>

                            {cartMessage && (
                                <div className="app-state">{cartMessage}</div>
                            )}

                            {menuItems.length === 0 ? (
                                <div className="app-state app-state--empty">
                                    No menu items yet.
                                </div>
                            ) : (
                                <div className="restaurant-grid">
                                    {menuItems.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            onAddToCart={handleAddToCart}
                                            addingId={addingId}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

export default RestaurantDetailPage;