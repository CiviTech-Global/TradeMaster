import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout fade-in">
      <div className="auth-layout__illustration">
        <div className="auth-layout__brand">
          <span className="auth-layout__logo-icon">🏪</span>
          <span className="auth-layout__logo-text">TradeMaster</span>
        </div>
        <h1 className="auth-layout__headline">
          Discover Local Businesses Near You
        </h1>
        <p className="auth-layout__description">
          Connect with trusted local sellers, explore interactive maps, and grow your community.
        </p>
        <div className="auth-layout__visual">
          <div className="auth-layout__map-pin" style={{ top: '20%', left: '20%' }}>🍽️</div>
          <div className="auth-layout__map-pin" style={{ top: '50%', left: '60%' }}>💈</div>
          <div className="auth-layout__map-pin" style={{ top: '70%', left: '30%' }}>🛒</div>
          <div className="auth-layout__map-pin" style={{ top: '35%', left: '75%' }}>🏥</div>
        </div>
      </div>
      <div className="auth-layout__form">
        <div className="auth-layout__form-card">
          <h2 className="auth-layout__title">{title}</h2>
          <p className="auth-layout__subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
