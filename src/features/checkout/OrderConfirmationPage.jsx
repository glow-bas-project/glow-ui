import { useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../shared/utils/formatPrice.js';

function OrderConfirmationPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const order = state?.order;

    return (
        <main className="app-shell">
            <div className="app-shell__inner">
                <header className="app-header">
                    <div className="app-brand">
                        <div className="app-brand__mark">G</div>
                        <div className="app-brand__copy">
                            <p className="app-brand__eyebrow">Glow</p>
                            <h1 className="app-brand__title">Order confirmed</h1>
                        </div>
                    </div>
                </header>

                <section className="app-search-panel">
                    <div className="app-search-panel__intro">
                        <h2 className="app-section-title">Thank you for your order!</h2>
                        <p className="app-section-copy">
                            Your order has been placed and the restaurant has been notified.
                        </p>
                        {order && (
                            <p className="app-section-copy">
                                Order total: <strong>{formatPrice(order.totalPrice)}</strong>
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="app-auth-button app-auth-button--primary"
                    >
                        Back to restaurants
                    </button>
                </section>
            </div>
        </main>
    );
}

export default OrderConfirmationPage;