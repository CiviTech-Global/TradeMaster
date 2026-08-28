import React from 'react';

interface TMInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const TMInput: React.FC<TMInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  style,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-on-surface)',
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-on-surface)',
          background: 'var(--color-surface)',
          border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-mix-12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default TMInput;
