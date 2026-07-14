import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch } from '../../application/redux';
import { initializeAuth } from '../../application/redux/slices/authSlice';
import { serverUrlConfig } from '../../infrastructure/api/serverUrlConfig';
import { networkService } from '../../infrastructure/api/NetworkService';
import { themeConfig } from '../../infrastructure/theme/themeConfig';
import ServerUrlSetup from './ServerUrlSetup';

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isUrlConfigured, setIsUrlConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize theme before first paint to avoid flashes.
    themeConfig.init();

    // Apply the persisted (or default) server URL before any requests fire.
    networkService.setBaseURL(serverUrlConfig.getUrl());

    const configured = serverUrlConfig.isConfigured();
    setIsUrlConfigured(configured);

    if (configured) {
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  if (isUrlConfigured === null) {
    // Minimal loader while checking localStorage.
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background, #FFF8F5)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border, #F0E6E0)',
          borderTop: '3px solid var(--color-primary, #FF6B6B)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isUrlConfigured) {
    return (
      <ServerUrlSetup
        onConfigured={() => {
          setIsUrlConfigured(true);
          dispatch(initializeAuth());
        }}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
