import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { userRepository } from '../../../infrastructure/repositories/user.repo';
import { networkService } from '../../../infrastructure/api/NetworkService';
import type {
  IUser,
  IUserCreationRequest,
  ISigninRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IChangePasswordRequest
} from '../../../infrastructure/repositories/user.repo';

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

export const signin = createAsyncThunk(
  'auth/signin',
  async (credentials: ISigninRequest, { rejectWithValue }) => {
    try {
      const response = await userRepository.signin(credentials);

      if (response.success && response.data?.data) {
        const { user, token } = response.data.data;

        if (token) {
          networkService.setAuthToken(token);
          localStorage.setItem('authToken', token);
        }

        return { user, token };
      } else {
        throw new Error(response.data?.error || response.data?.message || 'Signin failed');
      }
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error ||
                          (error as any)?.data?.error ||
                          (error as any)?.message ||
                          'Signin failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: IUserCreationRequest, { rejectWithValue }) => {
    try {
      const response = await userRepository.createUser(userData);

      if (response.success && response.data?.data) {
        const user = response.data.data;
        return { user, token: null };
      } else {
        throw new Error(response.data?.error || response.data?.message || 'Signup failed');
      }
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error ||
                          (error as any)?.data?.error ||
                          (error as any)?.message ||
                          'Signup failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: IForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await userRepository.forgotPassword(data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to send reset email');
      }

      return true;
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error ||
                          (error as any)?.data?.error ||
                          (error as any)?.message ||
                          'Failed to send reset email. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: IResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await userRepository.resetPassword(data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to reset password');
      }

      return true;
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error ||
                          (error as any)?.data?.error ||
                          (error as any)?.message ||
                          'Failed to reset password. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: IChangePasswordRequest, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };

    if (!state.auth.user) {
      return rejectWithValue('User must be authenticated to change password');
    }

    try {
      const response = await userRepository.changePassword(state.auth.user.id, data);

      if (!response.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to change password');
      }

      return true;
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error ||
                          (error as any)?.data?.error ||
                          (error as any)?.message ||
                          'Failed to change password. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    networkService.setBaseURL(baseURL);

    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (storedToken) {
      networkService.setAuthToken(storedToken);
      return { token: storedToken };
    }

    return null;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;

      networkService.clearAuthToken();
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })

      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload?.token) {
          state.token = action.payload.token;
        }
      });
  },
});

export const { signout, clearError, setUser } = authSlice.actions;