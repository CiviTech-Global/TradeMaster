import { useAppSelector } from '../redux';
import { selectUser } from '../redux/slices/authSlice';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const error = useAppSelector(state => state.auth.error);
  const accessToken = useAppSelector(state => state.auth.accessToken);
  const refreshToken = useAppSelector(state => state.auth.refreshToken);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    refreshToken,
  };
};