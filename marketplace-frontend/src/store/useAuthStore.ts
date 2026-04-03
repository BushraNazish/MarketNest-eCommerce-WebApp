import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types/auth';
import type { User } from '../types/auth';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    user: User | null; // Start tracking User object

    setAuth: (accessToken: string, refreshToken: string, role: UserRole) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            role: null,
            isAuthenticated: false,
            user: null,

            setAuth: (accessToken, refreshToken, role) =>
                set({
                    accessToken,
                    refreshToken,
                    role,
                    isAuthenticated: true
                }),

            logout: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    role: null,
                    isAuthenticated: false,
                    user: null
                }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
