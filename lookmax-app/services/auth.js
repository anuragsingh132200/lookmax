import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
    // Register new user
    async register(email, password, name) {
        const response = await api.post('/api/auth/register', {
            email,
            password,
            name,
        });

        if (response.data.access_token) {
            await SecureStore.setItemAsync('token', response.data.access_token);
        }

        return response.data;
    },

    // Login user
    async login(email, password) {
        const response = await api.post('/api/auth/login', {
            email,
            password,
        });

        if (response.data.access_token) {
            await SecureStore.setItemAsync('token', response.data.access_token);
        }

        return response.data;
    },

    // Google OAuth login
    async loginWithGoogle(idToken) {
        const response = await api.post('/api/auth/google', {
            idToken,
        });

        if (response.data.access_token) {
            await SecureStore.setItemAsync('token', response.data.access_token);
        }

        return response.data;
    },

    // Get current user
    async getCurrentUser() {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    // Logout
    async logout() {
        await SecureStore.deleteItemAsync('token');
    },

    // Check if logged in
    async isLoggedIn() {
        const token = await SecureStore.getItemAsync('token');
        return !!token;
    },

    // Save onboarding data
    async saveOnboarding(data) {
        const response = await api.put('/api/users/onboarding', data);
        return response.data;
    },

    // Update user state (e.g., hasSeenFeatureHighlights, hasCompletedFirstScan)
    async updateUserState(data) {
        const response = await api.put('/api/auth/update-state', data);
        return response.data;
    },
};

export default authService;
