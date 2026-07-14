import React from 'react';

export type TMBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';

interface TMBadgeProps {
  children: React.ReactNode;
  variant?: TMBadgeVariant;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const variantMap: Record<TMBadgeVariant, { bg: string; color: string }> = {
  primary: { bg: 'rgba(255, 107, 107, 0.12)', color: 'var(--color-primary)' },
  secondary: { bg: 'rgba(255, 167, 38, 0.12)', color: '#E65100' },
  success: { bg: 'rgba(102, 187, 106, 0.12)', color: 'var(--color-success)' },
  warning: { bg: 'rgba(255, 183, 77, 0.12)', color: '#EF6C00' },
  error: { bg: 'rgba(239, 83, 80, 0.12)', color: 'var(--color-error)' },
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
