import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/client';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate the existing token by calling /me
    authApi
      .me()
      .then((res) => {
        setUser({
          id: res.data.id,
          email: res.data.email,
          fullName: res.data.fullName,
          role: res.data.role,
        });
      })
      .catch(() => {
        // Token invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    });
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
  ) => {
    const { data } = await authApi.register({ email, password, fullName, role });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
