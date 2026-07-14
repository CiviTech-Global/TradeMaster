import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { forgotPassword, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) setValidationError('');
    if (error) dispatch(clearError());
  };

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await dispatch(forgotPassword({ email: email.trim() })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent a password reset link">
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          border: '1px solid rgba(102, 187, 106, 0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-success)',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          A password reset link has been sent to <strong>{email}</strong>.
        </div>
        <p style={{ textAlign: 'center' }}>
          <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to reset your password">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 83, 80, 0.1)',
            border: '1px solid rgba(239, 83, 80, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <TMInput
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          required
          error={validationError}
        />
        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          Send Reset Link
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        Remember your password?{' '}
        <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMForgotPassword;
