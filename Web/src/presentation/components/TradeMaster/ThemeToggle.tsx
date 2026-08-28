import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { themeConfig, type TMWebThemeMode } from '../../../infrastructure/theme/themeConfig';

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const [mode, setMode] = useState<TMWebThemeMode>('system');

  useEffect(() => {
    themeConfig.init();
    setMode(themeConfig.getMode());
  }, []);

  const handleChange = (next: TMWebThemeMode) => {
    themeConfig.setMode(next);
    setMode(next);
  };

  const modes: { value: TMWebThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: t('themeSystem'), icon: '💻' },
    { value: 'light', label: t('themeLight'), icon: '☀️' },
    { value: 'dark', label: t('themeDark'), icon: '🌙' },
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        padding: '4px',
        background: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {modes.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => handleChange(m.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: mode === m.value ? 'var(--color-surface)' : 'transparent',
            color: mode === m.value ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            fontWeight: mode === m.value ? 600 : 500,
            transition: 'background 150ms var(--ease-default), color 150ms var(--ease-default)',
          }}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
