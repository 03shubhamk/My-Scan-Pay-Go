import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('scan_pay_go_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('scan_pay_go_token');
      if (storedToken) {
        try {
          const response = await apiClient.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        const { user: userData, token: jwtToken } = response.data.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('scan_pay_go_token', jwtToken);
      }
    } catch (err: any) {
      // Offline fallback login for design review if backend is not live
      if (email === 'admin@scanpaygo.com' && password === 'Password@123') {
        const mockUser: User = {
          id: 'u1000000-0000-0000-0000-000000000001',
          name: 'Store Administrator',
          email: 'admin@scanpaygo.com',
          role: 'ADMIN',
        };
        const mockToken = 'mock_admin_jwt_token_12345';
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('scan_pay_go_token', mockToken);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('scan_pay_go_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
