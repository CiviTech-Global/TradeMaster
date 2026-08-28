import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '../../application/redux';
import { signout } from '../../application/redux/slices/authSlice';
import { userRepository } from '../repositories/user.repo';

/** Prevents concurrent/recursive signout dispatches; resets once signout finishes. */
let signoutPromise: Promise<unknown> | null = null;

function safeSignout(): void {
  if (signoutPromise) return;

  // Nothing to tear down (e.g. probe 401s on public pages); avoid a pointless
  // POST /auth/signout that would also spam the server logs.
  const state = store.getState();
  if (!state.auth.isAuthenticated && !state.auth.accessToken && !state.auth.user) {
    return;
  }

  signoutPromise = store.dispatch(signout()) as Promise<unknown>;
  signoutPromise.finally(() => {
    signoutPromise = null;
  });
}

/** Deduplicates concurrent token refreshes so parallel 401s share one attempt. */
let refreshPromise: Promise<unknown> | null = null;

function refreshTokens(refreshToken: string | null): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = userRepository
      .refreshToken(refreshToken ?? '')
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface AuthRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Authentication interceptor for handling JWT tokens automatically
 */
export class AuthInterceptor {
  private static instance: AuthInterceptor;

  private constructor() {}

  public static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  /**
   * Request interceptor - adds access token to requests
   */
  public requestInterceptor = (config: AuthRequestConfig): AuthRequestConfig => {
    // Skip adding auth header for authentication endpoints
    if (config.url?.includes('/auth/signin') ||
        config.url?.includes('/auth/signup') ||
        config.url?.includes('/auth/forgot-password') ||
        config.url?.includes('/auth/reset-password')) {
      return config;
    }

    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  };

  /**
   * Request error interceptor
   */
  public requestErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  };

  /**
   * Response interceptor - handles successful responses
   */
  public responseInterceptor = (response: AxiosResponse): AxiosResponse => {
    return response;
  };

  /**
   * Response error interceptor - handles token refresh and authentication errors
   */
  public responseErrorInterceptor = async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as AuthRequestConfig;

    // Skip token refresh for authentication endpoints (including signout to avoid loops,
    // verify-token which is a session probe, and refresh-token which must not retry itself).
    if (originalRequest.url?.includes('/auth/signin') ||
        originalRequest.url?.includes('/auth/signup') ||
        originalRequest.url?.includes('/auth/forgot-password') ||
        originalRequest.url?.includes('/auth/reset-password') ||
        originalRequest.url?.includes('/auth/signout') ||
        originalRequest.url?.includes('/auth/verify-token') ||
        originalRequest.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = store.getState();
      // May be null after a page reload; the server also accepts the httpOnly cookie.
      const refreshToken = state.auth.refreshToken;

      try {
        // Attempt to refresh the token (deduplicated across concurrent 401s)
        const response = (await refreshTokens(refreshToken)) as Awaited<
          ReturnType<typeof userRepository.refreshToken>
        >;

        if (response.success && response.data?.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update the store with new tokens
          store.dispatch({
            type: 'auth/updateTokens',
            payload: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          });

          // Update localStorage
          localStorage.setItem('authToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Import the HTTP client dynamically to avoid circular dependency
          const { httpService } = await import('./TMAxios');
          return httpService.getAxiosInstance().request(originalRequest);
        }

        safeSignout();
      } catch (refreshError) {
        // Refresh failed, sign out the user
        console.error('Token refresh failed:', refreshError);
        safeSignout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  };
}