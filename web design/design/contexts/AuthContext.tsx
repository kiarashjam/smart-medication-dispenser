import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '@/lib/mockData';

interface User {
  id: number;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - check against mock users
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const userData = {
      id: foundUser.id,
      email: foundUser.email,
      fullName: foundUser.fullName,
      role: foundUser.role,
    };

    const mockToken = `mock_jwt_${foundUser.id}_${Date.now()}`;
    localStorage.setItem('jwt_token', mockToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    // Mock registration
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const newUser = {
      id: mockUsers.length + 1,
      email,
      fullName,
      role,
    };

    const mockToken = `mock_jwt_${newUser.id}_${Date.now()}`;
    localStorage.setItem('jwt_token', mockToken);
    localStorage.setItem('user_data', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
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
