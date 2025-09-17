import React from 'react';
import './FormContainer.css';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle,
  children,
  footer,
  onSubmit
}) => {
  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">{title}</h1>
        {subtitle && <p className="form-subtitle">{subtitle}</p>}
      </div>
      <form className="form-content" onSubmit={onSubmit}>
        {children}
      </form>
      {footer && <div className="form-footer">{footer}</div>}
    </div>
  );
};

export default FormContainer;