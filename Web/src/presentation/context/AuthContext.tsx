import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import useAuth from '../hooks/useAuth';
import type { AuthHookReturn } from '../hooks/useAuth';
import { networkService } from '../../infrastructure/api/NetworkService';

const AuthContext = createContext<AuthHookReturn | undefined>(undefined);

export const useAuthContext = (): AuthHookReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    // Set base URL for the network service
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    networkService.setBaseURL(baseURL);

    // Check for stored authentication token on app initialization
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (storedToken) {
      networkService.setAuthToken(storedToken);

      // In a real application, you would validate the token here
      // and set the user if the token is valid
      // For now, we'll just set the token
    }
  }, []);

  // Save auth token when user signs in
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // In a real application, you would get the token from the signin response
      // For now, we'll create a dummy token
      const token = `user_${auth.user.id}_${Date.now()}`;
      localStorage.setItem('authToken', token);
      networkService.setAuthToken(token);
    }
  }, [auth.isAuthenticated, auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};