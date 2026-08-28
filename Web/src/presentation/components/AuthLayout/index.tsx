import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'authLayout' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });

  return (
    <div className="auth-layout fade-in">
      <div className="auth-layout__illustration">
        <div className="auth-layout__brand">
          <span className="auth-layout__logo-icon">🏪</span>
          <span className="auth-layout__logo-text">{commonT('appName')}</span>
        </div>
        <h1 className="auth-layout__headline">
          {t('headline')}
        </h1>
        <p className="auth-layout__description">
          {t('description')}
        </p>
        <div className="auth-layout__visual">
          <div className="auth-layout__map-pin floating-pin" style={{ top: '20%', '--pin-inline': '20%' } as CSSProperties}>🍽️</div>
          <div className="auth-layout__map-pin floating-pin" style={{ top: '50%', '--pin-inline': '60%' } as CSSProperties}>💈</div>
          <div className="auth-layout__map-pin floating-pin" style={{ top: '70%', '--pin-inline': '30%' } as CSSProperties}>🛒</div>
          <div className="auth-layout__map-pin floating-pin" style={{ top: '35%', '--pin-inline': '75%' } as CSSProperties}>🏥</div>
        </div>
      </div>
      <div className="auth-layout__form">
        <div className="auth-layout__form-card">
          <div className="auth-layout__language-row">
            <button
              type="button"
              className={`auth-layout__language-btn${i18n.language === 'fa' ? ' auth-layout__language-btn--active' : ''}`}
              onClick={() => i18n.changeLanguage('fa')}
            >
              فارسی
            </button>
            <button
              type="button"
              className={`auth-layout__language-btn${i18n.language === 'en' ? ' auth-layout__language-btn--active' : ''}`}
              onClick={() => i18n.changeLanguage('en')}
            >
              English
            </button>
          </div>
          <h2 className="auth-layout__title">{title}</h2>
          <p className="auth-layout__subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
