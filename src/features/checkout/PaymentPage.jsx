import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartApi } from '../../shared/api/apiClients.js';
import keycloak from '../../app/keycloak.js';

function PaymentPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const order = state?.order;
    const cart = state?.cart;

    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [expiry, setExpiry] = useState('12/30');
    const [cvc, setCvc] = useState('123');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!order) {
        return (
            <main className="app-shell">
                <div className="app-shell__inner">
                    <div className="app-state app-state--empty">
                        No order found. <button onClick={() => navigate('/')}>Go home</button>
                    </div>
                </div>
            </main>
        );
    }

    const handlePay = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const authHeader = { 'Authorization': `Bearer ${keycloak.token}` };

            // 1. Look up the payment record by stripe payment intent id
            const paymentResponse = await fetch(
                `/api/payment/payments/stripe/${order.stripePaymentIntentId}`,
                { headers: authHeader }
            );
            if (!paymentResponse.ok) throw new Error('Could not find payment record');
            const payment = await paymentResponse.json();

            // 2. Mark payment as succeeded in our payment-service
            const confirmResponse = await fetch(
                `/api/payment/payments/${payment.id}/confirm`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeader },
                    body: JSON.stringify({}),
                }
            );
            if (!confirmResponse.ok) throw new Error('Payment confirmation failed');

            // 3. Clear the cart
            await cartApi.delete('/carts/me');

            // 4. Go to confirmation page
            navigate('/order-confirmation', {
                state: { order },
                replace: true,
            });
        } catch (err) {
            console.error('Payment failed:', err);
            setError('Payment could not be processed. Please try again.');
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
                            <h1 className="app-brand__title">Payment</h1>
                        </div>
                    </div>
                    <div className="app-header__actions">
                        <button onClick={() => navigate(-1)}
                            className="app-auth-button app-auth-button--secondary">
                            Back
                        </button>
                    </div>
                </header>

                <section className="app-search-panel">
                    <div className="app-search-panel__intro">
                        <h2 className="app-section-title">Pay {order.totalPrice} kr</h2>
                        <p className="app-section-copy">
                            This is a test environment. Use the pre-filled fake card details below.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
                        <label className="app-search-label">
                            <span className="app-search-label__text">Card number</span>
                            <input
                                className="app-search-field__input"
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value)}
                            />
                        </label>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label className="app-search-label" style={{ flex: 1 }}>
                                <span className="app-search-label__text">Expiry (MM/YY)</span>
                                <input
                                    className="app-search-field__input"
                                    value={expiry}
                                    onChange={e => setExpiry(e.target.value)}
                                />
                            </label>
                            <label className="app-search-label" style={{ flex: 1 }}>
                                <span className="app-search-label__text">CVC</span>
                                <input
                                    className="app-search-field__input"
                                    value={cvc}
                                    onChange={e => setCvc(e.target.value)}
                                />
                            </label>
                        </div>

                        {error && <div className="app-state app-state--error">{error}</div>}

                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={submitting}
                            className="app-auth-button app-auth-button--primary"
                        >
                            {submitting ? 'Processing payment...' : `Pay ${order.totalPrice} kr`}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default PaymentPage;