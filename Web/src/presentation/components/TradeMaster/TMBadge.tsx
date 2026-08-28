import React from 'react';

export type TMBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';

interface TMBadgeProps {
  children: React.ReactNode;
  variant?: TMBadgeVariant;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const variantMap: Record<TMBadgeVariant, { bg: string; color: string }> = {
  primary: { bg: 'var(--color-primary-mix-12)', color: 'var(--color-primary)' },
  secondary: { bg: 'var(--color-secondary-mix-12)', color: 'var(--color-warning-text)' },
  success: { bg: 'var(--color-success-mix-12)', color: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-mix-12)', color: 'var(--color-warning-text)' },
  error: { bg: 'var(--color-error-mix-12)', color: 'var(--color-error)' },
  muted: { bg: 'var(--color-border)', color: 'var(--color-muted)' },
};

const TMBadge: React.FC<TMBadgeProps> = ({ children, variant = 'primary', icon, style }) => {
  const theme = variantMap[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 10px',
        borderRadius: 'var(--radius-sm)',
        background: theme.bg,
        color: theme.color,
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
};

export default TMBadge;
