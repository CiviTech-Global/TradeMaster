import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { userRepository } from '../../../infrastructure/repositories/user.repo';
import { networkService } from '../../../infrastructure/api/NetworkService';
import { serverUrlConfig } from '../../../infrastructure/api/serverUrlConfig';
import type {
  IUser,
  IUserCreationRequest,
  ISigninRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IChangePasswordRequest,
  APIResponse
} from '../../../infrastructure/repositories/user.repo';

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
};

export const signin = createAsyncThunk(
  'auth/signin',
  async (credentials: ISigninRequest, { rejectWithValue }) => {
    try {
      const response = await userRepository.signin(credentials);

      if (response.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        if (accessToken) {
          // The server also sets httpOnly cookies; for the web app we rely on those
          // instead of storing tokens in localStorage.
          networkService.setAuthToken(accessToken);
        }

        return { user, accessToken, refreshToken };
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
        const { user, accessToken, refreshToken } = response.data.data;

        if (accessToken) {
          networkService.setAuthToken(accessToken);
        }

        return { user, accessToken, refreshToken };
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
    const baseURL = serverUrlConfig.getUrl();
    networkService.setBaseURL(baseURL);

    const verify = async (): Promise<IUser | null> => {
      const response = await networkService.get<APIResponse<{ user: IUser; valid: boolean; expiresAt: string }>>('/auth/verify-token');
      return response.data.data?.user ?? null;
    };

    // The web app relies on httpOnly cookies set by the server; do not read tokens from storage.
    try {
      const user = await verify();
      if (user) return { user };
    } catch {
      // Access token missing/expired — attempt a single cookie-based refresh before giving up.
      try {
        await networkService.post('/auth/refresh-token', {}, { enableRetry: false });
        const user = await verify();
        if (user) return { user };
      } catch {
        // No valid session; remain signed out.
      }
    }

    return null;
  }
);

export const signout = createAsyncThunk(
  'auth/signout',
  async () => {
    try {
      // Best-effort server-side revocation; local cleanup happens regardless.
      await networkService.post('/auth/signout', undefined, {
        skipGlobalErrorHandling: true,
        enableRetry: false,
      });
    } catch {
      // Ignore network errors during signout.
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
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
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
      })

      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = !!action.payload.accessToken;
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

      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to initialize authentication';
      })

      .addCase(signout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
        state.error = null;

        networkService.clearAuthToken();
        // Tokens are stored in httpOnly cookies; clear any legacy localStorage entries.
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
      })
      .addCase(signout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Signout failed';
      });
  },
});

export const { clearError, setUser, updateTokens } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;