import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.select({
    android: 'http://10.0.2.2:8000/api',
    ios: 'http://localhost:8000/api',
    default: 'http://localhost:8000/api',
});

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            // Navigation will be handled by the auth state
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data: { email: string; name: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
};

// User API
export const userApi = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data: any) => api.put('/users/me', data),
    saveOnboarding: (data: any) => api.post('/users/onboarding', data),
};

// Scan API
export const scanApi = {
    analyze: (imageBase64: string) =>
        api.post('/scans/analyze', { imageBase64 }),
    getScans: () => api.get('/scans'),
    getScan: (id: string) => api.get(`/scans/${id}`),
    getLatest: () => api.get('/scans/latest/result'),
};

// Courses API
export const courseApi = {
    getCourses: () => api.get('/courses'),
    getCourse: (id: string) => api.get(`/courses/${id}`),
};

// Progress API
export const progressApi = {
    getProgress: () => api.get('/progress'),
    getCourseProgress: (courseId: string) => api.get(`/progress/${courseId}`),
    updateProgress: (courseId: string, data: any) =>
        api.put(`/progress/${courseId}`, data),
    completeChapter: (courseId: string, chapterId: string) =>
        api.post(`/progress/${courseId}/complete-chapter/${chapterId}`),
};

// Payment API
export const paymentApi = {
    createPaymentIntent: () => api.post('/payments/create-payment-intent'),
    verifyPayment: (paymentIntentId: string) =>
        api.post('/payments/verify', { payment_intent_id: paymentIntentId }),
    getStatus: () => api.get('/payments/status'),
};

export default api;
