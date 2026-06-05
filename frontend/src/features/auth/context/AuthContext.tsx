import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { UserResponse } from '../../../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (token: string, refreshToken: string | null | undefined, user: UserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function getStoredAuthUser(): UserResponse | null {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) return null;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
    if (isExpired) {
      clearStoredAuth();
      return null;
    }
    return JSON.parse(storedUser) as UserResponse;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => getStoredAuthUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredAuthUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    setUser(storedUser);
    setIsAuthenticated(!!storedUser);
    setIsInitializing(false);
  }, []);

  const login = (token: string, refreshToken: string | null | undefined, userData: UserResponse) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isInitializing) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
