import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 or 403 and we haven't retried yet
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().refreshToken;
                if (!refreshToken) throw new Error('No refresh token available');

                // Call the actual refresh endpoint
                const response = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { accessToken } = response.data;

                const currentRole = useAuthStore.getState().role;
                if (!currentRole) throw new Error('No role available');

                // Update the store
                useAuthStore.getState().setAuth(accessToken, refreshToken, currentRole);

                // Update headers and retry
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // If refresh fails, log out
                useAuthStore.getState().logout();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
