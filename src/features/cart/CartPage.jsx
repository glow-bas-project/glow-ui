import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../../app/keycloak.js';
import { cartApi } from '../../shared/api/apiClients.js';

function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.login({ redirectUri: window.location.href });
            return;
        }

        cartApi.get('/cart/carts/me')
            .then(res => {
                setCart(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load your cart.');
                setLoading(false);
            });
    }, []);

    const handleClear = async () => {
        try {
            await cartApi.delete('/cart/carts/me');
            setCart(prev => ({ ...prev, items: [], totalPrice: 0 }));
        } catch {
            setError('Could not clear cart.');
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
                            <h1 className="app-brand__title">Your cart</h1>
                        </div>
                    </div>
                    <div className="app-header__actions">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="app-auth-button app-auth-button--secondary"
                        >
                            Back to the main page
                        </button>
                        {keycloak.authenticated && (
                            <button
                                type="button"
                                onClick={() => keycloak.logout({ redirectUri: `${import.meta.env.VITE_APP_URL}/` })}
                                className="app-auth-button app-auth-button--secondary"
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                </header>

                <section className="app-search-panel">
                    {loading && (
                        <div className="app-state app-state--loading">Loading your cart...</div>
                    )}

                    {error && (
                        <div className="app-state app-state--error">{error}</div>
                    )}

                    {!loading && !error && cart && (
                        <>
                            {cart.items.length === 0 ? (
                                <div className="app-state app-state--empty">
                                    Your cart is empty.
                                </div>
                            ) : (
                                <>
                                    <div className="restaurant-grid">
                                        {cart.items.map((item, index) => (
                                            <article key={index} className="restaurant-card">
                                                <div className="restaurant-card__content">
                                                    <div className="restaurant-card__heading">
                                                        <h2 className="restaurant-card__title">
                                                            Menu item
                                                        </h2>
                                                        <p className="restaurant-card__location">
                                                            Qty: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="restaurant-card__tags">
                                                        <span className="restaurant-card__tag">
                                                            {item.price} kr
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <p><strong>Total: {cart.totalPrice} kr</strong></p>
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="app-auth-button app-auth-button--secondary"
                                        >
                                            Clear cart
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

export default CartPage;