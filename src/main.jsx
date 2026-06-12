import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthContext.jsx';
import App from './app/App.jsx';
import CartPage from './features/cart/CartPage.jsx';
import RestaurantDetailPage from './features/restaurants/RestaurantDetailPage.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);