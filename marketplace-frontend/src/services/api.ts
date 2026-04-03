import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
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

// Response interceptor to handle 401s (optional: add refresh logic here)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // const originalRequest = error.config;
        // if (error.response?.status === 401 && !originalRequest._retry) {
        //   // TODO: Implement refresh token logic
        // }
        return Promise.reject(error);
    }
);
