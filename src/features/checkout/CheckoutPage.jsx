import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import keycloak from '../../app/keycloak.js';
import { orderApi } from '../../shared/api/apiClients.js';

function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const cart = state?.cart;
    const restaurant = state?.restaurant;

    const [form, setForm] = useState({
        street: '',
        city: '',
        country: 'Denmark',
        phoneNumber: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!cart || cart.items.length === 0) {
        return (
            <main className="app-shell">
                <div className="app-shell__inner">
                    <div className="app-state app-state--empty">
                        Your cart is empty. <button onClick={() => navigate('/')}>Go back</button>
                    </div>
                </div>
            </main>
        );
    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!form.street || !form.city || !form.phoneNumber) {
            setError('Please fill in all fields.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const customerId = keycloak.tokenParsed?.sub;
            if (!customerId) throw new Error('Not authenticated');

            const restaurantAddr = restaurant?.address ?? {};

            const response = await orderApi.post('/checkout', {
                deliveryAddress: {
                    address: form.street,
                    city: form.city,
                    country: form.country,
                    latitude: 0,
                    longitude: 0,
                },
                restaurantAddress: {
                    address: restaurantAddr.address ?? '',
                    city: restaurantAddr.city ?? '',
                    country: restaurantAddr.country ?? 'Denmark',
                    latitude: restaurantAddr.latitude ?? 0,
                    longitude: restaurantAddr.longitude ?? 0,
                },
                phoneNumber: form.phoneNumber,
                customerId,
                totalPrice: cart.totalPrice,
                orderItems: cart.items.map(item => ({
                    menuItemId: item.menuItemId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });

            const order = response.data;

            // Navigate to payment with the order data
            navigate('/payment', {
                state: { order, cart },
            });
        } catch (err) {
            console.error('Checkout failed:', err);
            if (err?.response?.data) {
                console.error('Server error details:', err.response.data);
            }
            setError('Could not start checkout. Please try again.');
        } finally {
            setSubmitting(false);
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
                        <h1 className="app-brand__title">Checkout</h1>
                    </div>
                </div>
                <div className="app-header__actions">
                    <button onClick={() => navigate('/cart')}
                        className="app-auth-button app-auth-button--secondary">
                        Back to cart
                    </button>
                </div>
            </header>

            <section className="app-search-panel">
                <div className="app-search-panel__intro">
                    <h2 className="app-section-title">Delivery details</h2>
                    <p className="app-section-copy">
                        Order total: <strong>{cart.totalPrice} kr</strong> &mdash; {cart.items.length} item(s)
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
                    <label className="app-search-label">
                        <span className="app-search-label__text">Street address</span>
                        <input
                            className="app-search-field__input"
                            name="street"
                            value={form.street}
                            onChange={handleChange}
                            placeholder="e.g. Testvej 1"
                        />
                    </label>

                    <label className="app-search-label">
                        <span className="app-search-label__text">City</span>
                        <input
                            className="app-search-field__input"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="e.g. Aarhus"
                        />
                    </label>

                    <label className="app-search-label">
                        <span className="app-search-label__text">Country</span>
                        <input
                            className="app-search-field__input"
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="app-search-label">
                        <span className="app-search-label__text">Phone number</span>
                        <input
                            className="app-search-field__input"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="e.g. 12345678"
                        />
                    </label>

                    {error && <div className="app-state app-state--error">{error}</div>}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="app-auth-button app-auth-button--primary"
                    >
                        {submitting ? 'Processing...' : 'Proceed to payment'}
                    </button>
                </div>
            </section>
        </div>
    </main>
);
}

export default CheckoutPage;