import type { RoleKey } from "~/types/navigation";

export const AUTH_TOKEN_KEY = "token";
export const AUTH_ROLE_KEY = "authRole";

export const mockAuth = {
    /**
     * Đổi giá trị này để Test các luồng khác nhau.
     * Giá trị hợp lệ: "public" | "owner" | "reception" | "doctor" | "admin"
     */
    currentRole: "admin" as RoleKey,

    isAuthenticated: true,
};

export function getStoredToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredRole(): RoleKey {
    return (localStorage.getItem(AUTH_ROLE_KEY) as RoleKey | null) ?? "public";
}

export function saveAuthSession(token: string, role: RoleKey = "admin") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_ROLE_KEY, role);
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
}

export function isAuthenticated() {
    return Boolean(getStoredToken());
}
