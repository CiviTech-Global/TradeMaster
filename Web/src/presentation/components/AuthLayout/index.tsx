import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  illustration: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, illustration }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__illustration">
        {illustration}
      </div>
      <div className="auth-layout__form">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;