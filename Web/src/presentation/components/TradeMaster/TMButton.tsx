import React, { useState } from 'react';

export type TMButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

interface TMButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: TMButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const TMButton: React.FC<TMButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  isFullWidth = false,
  icon,
  style,
}) => {
  const [pressed, setPressed] = useState(false);

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    minHeight: '48px',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid transparent',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    width: isFullWidth ? '100%' : 'auto',
    transition: 'transform 150ms var(--ease-spring), background 150ms var(--ease-default)',
    transform: pressed ? 'scale(0.97)' : 'scale(1)',
  };

  const variantStyles: Record<TMButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      boxShadow: '0 4px 12px var(--color-primary-mix-25)',
    },
    secondary: {
      background: 'var(--color-secondary)',
      color: 'var(--color-on-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-primary)',
    },
    outline: {
      background: 'var(--color-surface)',
      color: 'var(--color-on-surface)',
      borderColor: 'var(--color-border)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
    >
      {isLoading ? (
        <span
          style={{
            width: '18px',
            height: '18px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default TMButton;
