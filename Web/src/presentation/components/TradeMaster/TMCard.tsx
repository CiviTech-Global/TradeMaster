import React from 'react';

interface TMCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  glassmorphic?: boolean;
  style?: React.CSSProperties;
  padding?: string | number;
}

const TMCard: React.FC<TMCardProps> = ({
  children,
  onClick,
  glassmorphic = false,
  style,
  padding = '16px',
}) => {
  const baseStyles: React.CSSProperties = {
    background: glassmorphic
      ? 'var(--color-surface-glass)'
      : 'var(--color-surface)',
    backdropFilter: glassmorphic ? 'blur(10px)' : undefined,
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${glassmorphic ? 'var(--color-on-surface-mix-5)' : 'var(--color-border)'}`,
    boxShadow: 'var(--shadow-md)',
    padding,
    transition: 'transform 200ms var(--ease-default), box-shadow 200ms var(--ease-default)',
    cursor: onClick ? 'pointer' : undefined,
  };

  return (
    <div
      onClick={onClick}
      className={onClick ? 'hover-lift' : undefined}
      style={{ ...baseStyles, ...style }}
    >
      {children}
    </div>
  );
};

export default TMCard;
