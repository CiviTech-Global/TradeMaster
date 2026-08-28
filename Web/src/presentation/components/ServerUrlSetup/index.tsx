import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { serverUrlConfig } from '../../../infrastructure/api/serverUrlConfig';
import { networkService } from '../../../infrastructure/api/NetworkService';
import { SUPPORTED_LANGUAGES } from '../../../infrastructure/i18n/i18n';
import './ServerUrlSetup.css';

interface ServerUrlSetupProps {
  onConfigured?: () => void;
}

const ServerUrlSetup: React.FC<ServerUrlSetupProps> = ({ onConfigured }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'serverUrlSetup' });
  const [url, setUrl] = useState(serverUrlConfig.getDefaultUrl());
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError(t('urlRequired'));
      return;
    }

    setIsSaving(true);
    const sanitized = serverUrlConfig.sanitize(trimmed);
    serverUrlConfig.setUrl(sanitized);
    networkService.setBaseURL(sanitized);
    setIsSaving(false);
    onConfigured?.();
  };

  return (
    <div className="server-url-setup">
      <div className="server-url-setup__card">
        <div className="server-url-setup__language-row">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`server-url-setup__language-btn${i18n.language === lang ? ' server-url-setup__language-btn--active' : ''}`}
              onClick={() => i18n.changeLanguage(lang)}
            >
              {lang === 'fa' ? 'فارسی' : 'English'}
            </button>
          ))}
        </div>
        <div className="server-url-setup__icon">🏪</div>
        <h1 className="server-url-setup__title">{t('welcomeTitle')}</h1>
        <p className="server-url-setup__subtitle">
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="server-url-setup__form">
          <label className="server-url-setup__label" htmlFor="server-url">
            {t('label')}
          </label>
          <input
            id="server-url"
            type="url"
            className="server-url-setup__input"
            placeholder={t('placeholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSaving}
          />
          {error && <p className="server-url-setup__error">{error}</p>}
          <p className="server-url-setup__hint">
            {t('hint')}
          </p>

          <button type="submit" className="server-url-setup__button" disabled={isSaving}>
            {isSaving ? t('connecting') : t('connect')}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ServerUrlSetup;
