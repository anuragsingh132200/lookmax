import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log('Auth check failed:', error);
            await SecureStore.deleteItemAsync('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        return result;
    };

    const register = async (email, password, name) => {
        const result = await authService.register(email, password, name);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
