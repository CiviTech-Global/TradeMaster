import React, { useState } from 'react';
import { serverUrlConfig } from '../../../infrastructure/api/serverUrlConfig';
import { networkService } from '../../../infrastructure/api/NetworkService';

interface ServerUrlSetupProps {
  onConfigured?: () => void;
}

const ServerUrlSetup: React.FC<ServerUrlSetupProps> = ({ onConfigured }) => {
  const [url, setUrl] = useState(serverUrlConfig.getDefaultUrl());
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a server URL');
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
        <div className="server-url-setup__icon">🏪</div>
        <h1 className="server-url-setup__title">Welcome to TradeMaster</h1>
        <p className="server-url-setup__subtitle">
          Enter your server address to get started. You can change this later in
          Settings.
        </p>

        <form onSubmit={handleSubmit} className="server-url-setup__form">
          <label className="server-url-setup__label" htmlFor="server-url">
            Server URL
          </label>
          <input
            id="server-url"
            type="url"
            className="server-url-setup__input"
            placeholder="e.g. 192.168.1.100:3000"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSaving}
          />
          {error && <p className="server-url-setup__error">{error}</p>}
          <p className="server-url-setup__hint">
            Tip: Use your computer&apos;s local IP if testing on a physical device.
          </p>

          <button type="submit" className="server-url-setup__button" disabled={isSaving}>
            {isSaving ? 'Connecting…' : 'Connect'}
          </button>
        </form>
      </div>

      <style>{`
        .server-url-setup {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--color-background, #FFF8F5) 0%, #FFEAE5 100%);
        }

        .server-url-setup__card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .server-url-setup__icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .server-url-setup__title {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-on-surface, #2D2D2D);
        }

        .server-url-setup__subtitle {
          margin: 0 0 1.5rem;
          color: var(--color-on-surface-variant, #6B6B6B);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .server-url-setup__form {
          text-align: left;
        }

        .server-url-setup__label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-on-surface, #2D2D2D);
        }

        .server-url-setup__input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          border: 1px solid var(--color-border, #F0E6E0);
          border-radius: 12px;
          background: var(--color-surface, #FFFFFF);
          color: var(--color-on-surface, #2D2D2D);
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .server-url-setup__input:focus {
          outline: none;
          border-color: var(--color-primary, #FF6B6B);
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.12);
        }

        .server-url-setup__error {
          color: var(--color-error, #EF5350);
          font-size: 0.875rem;
          margin: 0.5rem 0 0;
        }

        .server-url-setup__hint {
          color: var(--color-muted, #8D8D8D);
          font-size: 0.8rem;
          margin: 0.75rem 0 1.25rem;
        }

        .server-url-setup__button {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background: var(--color-primary, #FF6B6B);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }

        .server-url-setup__button:hover:not(:disabled) {
          background: var(--color-primary-dark, #E85555);
        }

        .server-url-setup__button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ServerUrlSetup;
