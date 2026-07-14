import React from 'react';
import TMButton from './TMButton';

interface TMEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const TMEmptyState: React.FC<TMEmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          background: 'rgba(255, 107, 107, 0.12)',
          marginBottom: '24px',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            margin: '0 0 24px',
            color: 'var(--color-on-surface-variant)',
            maxWidth: '320px',
          }}
        >
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <TMButton onClick={onAction} variant="primary">
          {actionLabel}
        </TMButton>
      )}
    </div>
  );
};

export default TMEmptyState;
