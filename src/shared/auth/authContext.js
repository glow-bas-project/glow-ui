import { createContext } from 'react';

export const AuthContext = createContext({
    initialized: false,
    isAuthenticated: false,
});
