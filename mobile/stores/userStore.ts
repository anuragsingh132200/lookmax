import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from '../services/api';

interface OnboardingData {
    age?: number;
    gender?: string;
    goals?: string[];
    skinType?: string;
    concerns?: string[];
    currentRoutine?: string;
}

interface Subscription {
    status: 'free' | 'active' | 'cancelled';
    expiresAt?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    onboarding?: OnboardingData;
    subscription?: Subscription;
    isOnboarded: boolean;
    hasCompletedFirstScan: boolean;
}

interface UserState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    loadUser: () => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    isSubscribed: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setToken: async (token) => {
        if (token) {
            await AsyncStorage.setItem('token', token);
        } else {
            await AsyncStorage.removeItem('token');
        }
        set({ token });
    },

    loadUser: async () => {
        try {
            set({ isLoading: true });
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                set({ isLoading: false, isAuthenticated: false });
                return;
            }

            set({ token });

            const response = await userApi.getProfile();
            set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load user:', error);
            await AsyncStorage.removeItem('token');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
            set({ user: { ...currentUser, ...data } });
        }
    },

    isSubscribed: () => {
        const user = get().user;
        return user?.subscription?.status === 'active';
    },
}));
