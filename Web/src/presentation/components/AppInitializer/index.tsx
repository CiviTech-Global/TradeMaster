import React, { useEffect } from 'react';
import { useAppDispatch } from '../../../application/redux/hooks';
import { initializeAuth, initializeTheme } from '../../../application/redux';
import NotificationContainer from '../NotificationContainer';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeTheme());
  }, [dispatch]);

  return (
    <>
      {children}
      <NotificationContainer />
    </>
  );
};

export default AppInitializer;