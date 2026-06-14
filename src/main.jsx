import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthContext.jsx';
import App from './app/App.jsx';
import CartPage from './features/cart/CartPage.jsx';
import RestaurantDetailPage from './features/restaurants/RestaurantDetailPage.jsx';
import CheckoutPage from './features/checkout/CheckoutPage.jsx';
import PaymentPage from './features/checkout/PaymentPage.jsx';
import OrderConfirmationPage from './features/checkout/OrderConfirmationPage.jsx';
import { getRouterBasename } from './app/runtimeConfig.js';
import RestaurantOrdersPage from './features/restaurants/RestaurantOrdersPage.jsx';
import RestaurantDashboardPage from './features/restaurants/RestaurantDashboardPage.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <BrowserRouter basename={getRouterBasename()}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/restaurants/:id/orders" element={<RestaurantOrdersPage />} />
                    <Route path="/restaurant-dashboard" element={<RestaurantDashboardPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);