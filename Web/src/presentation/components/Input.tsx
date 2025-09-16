import React from 'react';
import './Input.css';

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false
}) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default Input;