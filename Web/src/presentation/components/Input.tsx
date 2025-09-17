import React from 'react';
import './Input.css';

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  error
}) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <input
        className={`input-field ${error ? 'input-field-error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && (
        <span className="input-error-message">{error}</span>
      )}
    </div>
  );
};

export default Input;