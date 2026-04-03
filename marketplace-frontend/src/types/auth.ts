export const UserRole = {
    CUSTOMER: 'CUSTOMER',
    SELLER: 'SELLER',
    ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userRole: UserRole;
    user?: User; // Optional, might be useful to return full user object
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
}
