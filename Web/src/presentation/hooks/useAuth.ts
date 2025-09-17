import { useState, useCallback } from 'react';
import { userRepository } from '../../infrastructure/repositories/user.repo';
import type { IUser, IUserCreationRequest, ISigninRequest, IForgotPasswordRequest, IResetPasswordRequest, IChangePasswordRequest } from '../../infrastructure/repositories/user.repo';
import { networkService } from '../../infrastructure/api/NetworkService';

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthHookReturn extends AuthState {
  signin: (credentials: ISigninRequest) => Promise<void>;
  signup: (userData: IUserCreationRequest) => Promise<void>;
  signout: () => void;
  forgotPassword: (data: IForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: IResetPasswordRequest) => Promise<void>;
  changePassword: (data: IChangePasswordRequest) => Promise<void>;
  clearError: () => void;
  setUser: (user: IUser | null) => void;
}

const useAuth = (): AuthHookReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  const setUser = useCallback((user: IUser | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signin = useCallback(async (credentials: ISigninRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userRepository.signin(credentials);

      if (response.success && response.data?.data) {
        const { user, token } = response.data.data;
        setUser(user);

        // Set auth token
        if (token) {
          networkService.setAuthToken(token);
          localStorage.setItem('authToken', token);
        }
      } else {
        throw new Error(response.data?.error || response.data?.message || 'Signin failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
                          error?.data?.error ||
                          error?.message ||
                          'Signin failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const signup = useCallback(async (userData: IUserCreationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userRepository.createUser(userData);

      if (response.success && response.data?.data) {
        const user = response.data.data;
        setUser(user);

        // Set auth token if available
        // networkService.setAuthToken('your-jwt-token');
      } else {
        throw new Error(response.data?.error || response.data?.message || 'Signup failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
                          error?.data?.error ||
                          error?.message ||
                          'Signup failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const signout = useCallback(() => {
    setUser(null);
    networkService.clearAuthToken();
    // Clear any stored tokens from localStorage/sessionStorage
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }, [setUser]);

  const forgotPassword = useCallback(async (data: IForgotPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userRepository.forgotPassword(data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
                          error?.data?.error ||
                          error?.message ||
                          'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: IResetPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userRepository.resetPassword(data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
                          error?.data?.error ||
                          error?.message ||
                          'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: IChangePasswordRequest) => {
    if (!authState.user) {
      throw new Error('User must be authenticated to change password');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await userRepository.changePassword(authState.user.id, data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
                          error?.data?.error ||
                          error?.message ||
                          'Failed to change password. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  return {
    ...authState,
    signin,
    signup,
    signout,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,
    setUser,
  };
};

export default useAuth;