import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { resetPassword, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMSetNewPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [token, setToken] = useState<string>('');
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setIsValidToken(false);
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) dispatch(clearError());
  };

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(resetPassword({
        token,
        newPassword: formData.password
      })).unwrap();

      navigate('/signin?message=Password reset successful. Please sign in with your new password.');
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  if (!isValidToken) {
    return (
      <AuthLayout title="Invalid Reset Link" subtitle="The link is invalid or has expired">
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(239, 83, 80, 0.1)',
          border: '1px solid rgba(239, 83, 80, 0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          This password reset link is invalid or has expired.
        </div>
        <Link to="/forgot-password">
          <TMButton type="button" isFullWidth>
            Request New Reset Link
          </TMButton>
        </Link>
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password" subtitle="Create a strong password for your account">
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
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleInputChange('password')}
          required
          error={validationErrors.password}
        />
        <TMInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          required
          error={validationErrors.confirmPassword}
        />
        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {isLoading ? 'Updating...' : 'Update Password'}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSetNewPassword;
