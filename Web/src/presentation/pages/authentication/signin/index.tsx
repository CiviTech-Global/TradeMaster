import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { signin, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMSignin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(signin({
        email: formData.email.trim(),
        password: formData.password
      })).unwrap();

      navigate('/dashboard');
    } catch (error) {
      console.error('Signin failed:', error);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your business directory">
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
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          error={validationErrors.email}
        />
        <TMInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          required
          error={validationErrors.password}
        />

        <div style={{ textAlign: 'right' }}>
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-sm)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Forgot password?
          </Link>
        </div>

        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          Sign In
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSignin;
