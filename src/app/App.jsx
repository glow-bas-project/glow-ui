import { useEffect, useMemo, useState } from 'react';
import keycloak from './keycloak.js';
import { userApi } from '../shared/api/apiClients.js';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { useCartSummary } from '../shared/hooks/useCartSummary.js';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants.js';
import { useNavigate } from 'react-router-dom';
import './App.css';

const restaurantImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
];

function getRestaurantName(restaurant) {
    return restaurant?.name ?? 'Unnamed restaurant';
}

function getRestaurantImage(restaurant, index) {
    return (
        restaurant?.imageUrl ??
        restaurant?.photoUrl ??
        restaurant?.coverImage ??
        restaurantImages[index % restaurantImages.length]
    );
}

function getRestaurantTags(restaurant) {
    const tags = [
        ...(Array.isArray(restaurant?.tags) ? restaurant.tags : []),
        ...(Array.isArray(restaurant?.categories) ? restaurant.categories : []),
        ...(Array.isArray(restaurant?.cuisines) ? restaurant.cuisines : []),
    ];

    if (tags.length > 0) {
        return tags.slice(0, 3);
    }

    const fallbackTags = [];

    if (restaurant?.address?.city) {
        fallbackTags.push(restaurant.address.city);
    }

    if (restaurant?.menuItems?.length) {
        fallbackTags.push(`${restaurant.menuItems.length} dishes`);
    }

    if (restaurant?.openingHours) {
        fallbackTags.push('Open today');
    }

    return fallbackTags.slice(0, 3);
}

function RestaurantCard({ restaurant, index, onClick }) {
    const tags = getRestaurantTags(restaurant);

    return (
        <article className="restaurant-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="restaurant-card__media">
                <img
                    src={getRestaurantImage(restaurant, index)}
                    alt={getRestaurantName(restaurant)}
                    className="restaurant-card__image"
                />
                <div className="restaurant-card__overlay" />
            </div>

            <div className="restaurant-card__content">
                <div className="restaurant-card__heading">
                    <h2 className="restaurant-card__title">{getRestaurantName(restaurant)}</h2>
                    <p className="restaurant-card__location">
                        {restaurant?.address?.city ?? restaurant?.address?.address ?? 'Local favourite'}
                    </p>
                </div>

                {tags.length > 0 && (
                    <div className="restaurant-card__tags">
                        {tags.map((tag) => (
                            <span key={tag} className="restaurant-card__tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

let keycloakInitPromise = null;

function App() {
    const { initialized, isAuthenticated, setIsAuthenticated, setInitialized } = useAuth();
    const [isProfileSynced, setIsProfileSynced] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { restaurants, loading, error } = useRestaurants(searchTerm);

    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        keycloak.onAuthSuccess = () => {
            if (!cancelled) {
                setIsAuthenticated(true);
            }
        };

        keycloak.onAuthLogout = () => {
            if (!cancelled) {
                setIsAuthenticated(false);
            }
        };

        if (!keycloakInitPromise) {
            keycloakInitPromise = keycloak.init({
                pkceMethod: 'S256',
                checkLoginIframe: false,
            });
        }

        keycloakInitPromise
            .then((authenticated) => {
                if (!cancelled) {
                    setIsAuthenticated(authenticated);
                    setInitialized(true);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setInitialized(true);
                    setIsAuthenticated(Boolean(keycloak.authenticated));
                }
            });

        return () => {
            cancelled = true;
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthLogout = undefined;
        };
    }, [setIsAuthenticated, setInitialized]);

    useEffect(() => {
        if (!initialized || !isAuthenticated) {
            return undefined;
        }

        const syncProfile = async () => {
            try {
                const token = keycloak.tokenParsed ?? {};
                const name = [token.given_name, token.family_name]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || token.preferred_username || null;

                await userApi.post('/sync-profile', { name });
            } catch (error) {
                console.error('Failed to sync profile:', error);
            } finally {
                setIsProfileSynced(true);
            }
        };

        syncProfile();
    }, [initialized, isAuthenticated]);

    const { itemCount: cartItemCount } = useCartSummary(initialized && isAuthenticated && isProfileSynced);

    const handleSignIn = () => {
        keycloak.login({
            redirectUri: window.location.origin,
        });
    };

    const handleSignOut = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const restaurantCountLabel = useMemo(() => {
        if (loading) {
            return 'Loading restaurants...';
        }

        if (searchTerm.trim()) {
            return `${restaurants.length} result${restaurants.length === 1 ? '' : 's'} for “${searchTerm.trim()}”`;
        }

        return `${restaurants.length} restaurant${restaurants.length === 1 ? '' : 's'} available`;
    }, [loading, restaurants.length, searchTerm]);

    return (
        <main className="app-shell">
            <div className="app-shell__inner">
                <header className="app-header">
                    <div className="app-brand">
                        <div className="app-brand__mark">
                            G
                        </div>
                        <div className="app-brand__copy">
                            <p className="app-brand__eyebrow">Glow</p>
                            <h1 className="app-brand__title">
                                Restaurant discovery, simplified
                            </h1>
                            <p className="app-brand__subtitle">
                                {initialized
                                    ? isAuthenticated
                                        ? `Signed in as ${keycloak.tokenParsed?.preferred_username ?? 'user'}`
                                        : 'Authentication initialised. Sign in to continue.'
                                    : 'Initialising authentication...'}
                            </p>
                        </div>
                    </div>

                    <div className="app-header__actions">
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => navigate('/cart')}
                                className="app-auth-button app-auth-button--secondary"
                            >
                                Cart ({cartItemCount})
                            </button>
                        )}
                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="app-auth-button app-auth-button--secondary"
                            >
                                Sign out
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSignIn}
                                disabled={!initialized}
                                className="app-auth-button app-auth-button--primary"
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                </header>

                <section className="app-search-panel">
                    <div className="app-search-panel__intro">
                        <div>
                            <p className="app-section-kicker">
                                Find your next meal
                            </p>
                            <h2 className="app-section-title">
                                Search restaurants near you
                            </h2>
                            <p className="app-section-copy">
                                Browse the Glow restaurant catalogue, filter by name or cuisine, and jump into the
                                first version of the food discovery experience.
                            </p>
                        </div>

                        <label className="app-search-label">
                            <span className="app-search-label__text">Search restaurants</span>
                            <div className="app-search-field">
                                <svg
                                    className="app-search-field__icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-3.5-3.5" />
                                </svg>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search by restaurant name or cuisine"
                                    className="app-search-field__input"
                                />
                            </div>
                        </label>

                        <div className="app-search-summary">
                            <p>{restaurantCountLabel}</p>
                            {searchTerm.trim() && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="app-search-summary__clear"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="app-state app-state--error">
                            Could not load restaurants right now. Please try again.
                        </div>
                    )}

                    {!error && loading && (
                        <div className="app-state app-state--loading">
                            Loading restaurants...
                        </div>
                    )}

                    {!error && !loading && restaurants.length === 0 && (
                        <div className="app-state app-state--empty">
                            No restaurants match your search.
                        </div>
                    )}

                    {!error && !loading && restaurants.length > 0 && (
                        <div className="restaurant-grid">
                            {restaurants.map((restaurant, index) => (
                                <RestaurantCard
                                    key={restaurant.id ?? restaurant.name ?? index}
                                    restaurant={restaurant}
                                    index={index}
                                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default App;
