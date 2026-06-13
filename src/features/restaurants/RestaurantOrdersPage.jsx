import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantApi } from '../../shared/api/apiClients.js';
import { formatPrice } from '../../shared/utils/formatPrice.js';
import { usePollingResource } from '../../shared/hooks/usePollingResource.js';

const COLUMNS = [
    { key: 'PROCESSING', label: 'Incoming orders' },
    { key: 'PREPARING', label: 'In preparation' },
    { key: 'COMPLETED', label: 'Ready for pick up' },
];

const NEXT_STATUS = {
    PROCESSING: { status: 'PREPARING', label: 'Accept & start preparing' },
    PREPARING:  { status: 'COMPLETED', label: 'Mark as ready' },
    COMPLETED:  { status: 'DELIVERING', label: 'Done – order has been picked up' },
};

function OrderCard({ order, restaurantId, onStatusChange }) {
    const [updating, setUpdating] = useState(false);
    const next = NEXT_STATUS[order.status];

    const handleAdvance = async () => {
        setUpdating(true);
        try {
            await restaurantApi.patch(
                `/restaurants/${restaurantId}/orders/${order.orderId}/status`,
                { status: next.status }
            );
            onStatusChange(order.orderId, next.status);
        } catch (err) {
            console.error('Failed to update order status:', err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <article className="restaurant-card">
            <div className="restaurant-card__content">
                <div className="restaurant-card__heading">
                    <h2 className="restaurant-card__title">
                        Order #{order.orderId.slice(0, 8)}
                    </h2>
                    <p className="restaurant-card__location">{order.customerPhone}</p>
                </div>

                <ul style={{ margin: '0.5rem 0', padding: 0, listStyle: 'none' }}>
                    {order.items.map((item, i) => (
                        <li key={i} className="restaurant-card__location">
                            {item.quantity}× {item.name} – {formatPrice(item.price)}
                        </li>
                    ))}
                </ul>

                <div className="restaurant-card__tags">
                    <span className="restaurant-card__tag">
                        Total: {formatPrice(order.totalPrice)}
                    </span>
                </div>

                <p className="restaurant-card__location" style={{ marginTop: '0.5rem' }}>
                    Deliver to: {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                </p>

                {next && (
                    <button
                        type="button"
                        onClick={handleAdvance}
                        disabled={updating}
                        className="app-auth-button app-auth-button--primary"
                        style={{ marginTop: '0.75rem' }}
                    >
                        {updating ? 'Updating...' : next.label}
                    </button>
                )}
            </div>
        </article>
    );
}

function RestaurantOrdersPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [statusOverrides, setStatusOverrides] = useState({});

    const fetchOrders = useCallback(async () => {
        const res = await restaurantApi.get(`/restaurants/${id}/orders`);
        return res.data;
    }, [id]);

    const { data, loading, error, refresh } = usePollingResource(fetchOrders, 15000);

    const handleStatusChange = useCallback((orderId, newStatus) => {
        setStatusOverrides(prev => ({ ...prev, [orderId]: newStatus }));
    }, []);

    const orders = (data ?? []).map(order => ({
        ...order,
        status: statusOverrides[order.orderId] ?? order.status,
    }));

    const activeOrders = orders.filter(o => o.status !== 'DELIVERING');
    const fulfilledOrders = orders.filter(o => o.status === 'DELIVERING');

    return (
        <main className="app-shell">
            <div className="app-shell__inner">
                <header className="app-header">
                    <div className="app-brand">
                        <div className="app-brand__mark">G</div>
                        <div className="app-brand__copy">
                            <p className="app-brand__eyebrow">Glow</p>
                            <h1 className="app-brand__title">Restaurant orders</h1>
                        </div>
                    </div>
                    <div className="app-header__actions">
                        <button
                            type="button"
                            onClick={refresh}
                            className="app-auth-button app-auth-button--secondary"
                        >
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="app-auth-button app-auth-button--secondary"
                        >
                            Back
                        </button>
                    </div>
                </header>

                <section className="app-search-panel">
                    {loading && (
                        <div className="app-state app-state--loading">Loading orders...</div>
                    )}
                    {error && (
                        <div className="app-state app-state--error">Could not load orders.</div>
                    )}
                    {!loading && !error && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                {COLUMNS.map(col => {
                                    const colOrders = activeOrders.filter(o => o.status === col.key);
                                    return (
                                        <div key={col.key}>
                                            <h2 className="app-section-title" style={{ marginBottom: '1rem' }}>
                                                {col.label}
                                                <span className="restaurant-card__tag" style={{ marginLeft: '0.5rem' }}>
                                                    {colOrders.length}
                                                </span>
                                            </h2>
                                            {colOrders.length === 0 ? (
                                                <div className="app-state app-state--empty">No orders</div>
                                            ) : (
                                                colOrders.map(order => (
                                                    <OrderCard
                                                        key={order.orderId}
                                                        order={order}
                                                        restaurantId={id}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {fulfilledOrders.length > 0 && (
                                <div style={{ marginTop: '2.5rem' }}>
                                    <h2 className="app-section-title" style={{ marginBottom: '1rem' }}>
                                        Fulfilled orders
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {fulfilledOrders.map(order => (
                                            <div
                                                key={order.orderId}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '0.75rem 0',
                                                    borderBottom: '1px solid var(--color-border, #e5e7eb)'
                                                }}
                                            >
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                    #{order.orderId.slice(0, 8)}
                                                </span>
                                                <span style={{ flex: 1, color: 'var(--color-text-secondary, #6b7280)', fontSize: '0.875rem' }}>
                                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                                                </span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                    {formatPrice(order.totalPrice)}
                                                </span>
                                                <span className="restaurant-card__tag">Fulfilled</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

export default RestaurantOrdersPage;