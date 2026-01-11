import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get the machine's IP from Expo debugger URL or use fallback
// For physical devices, use your computer's local IP address
// The backend runs on port 8000
const getApiUrl = () => {
    // Try to get IP from Expo's debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:8000`;
    }

    // Fallback - update this to your machine's IP if needed
    return 'http://10.137.35.242:8000';
};

const API_BASE_URL = getApiUrl();

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('API Error:', error.config?.url, error.message);
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('token');
            // Handle logout - redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
