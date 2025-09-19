import React, { useEffect, ReactNode } from 'react';
import { useAppDispatch } from '../../application/redux';
import { initializeAuth } from '../../application/redux/slices/authSlice';

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AppInitializer;