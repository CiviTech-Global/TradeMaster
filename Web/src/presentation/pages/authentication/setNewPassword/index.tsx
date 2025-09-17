import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { resetPassword, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

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
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear auth errors
    if (error) {
      dispatch(clearError());
    }
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

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(resetPassword({
        token,
        newPassword: formData.password
      })).unwrap();

      // Navigate to signin page on successful password reset
      navigate('/signin?message=Password reset successful. Please sign in with your new password.');
    } catch (error) {
      // Error is already handled by the Redux slice
      console.error('Reset password failed:', error);
    }
  };

  const footer = (
    <p>
      <Link to="/signin">Back to sign in</Link>
    </p>
  );

  if (!isValidToken) {
    return (
      <AuthLayout illustration={<AuthIllustration />}>
        <FormContainer
          title="Invalid Reset Link"
          subtitle="The password reset link is invalid or has expired"
          footer={footer}
        >
          <div style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            This password reset link is invalid or has expired.
            Please request a new password reset link.
          </div>
          <Link to="/forgot-password">
            <Button type="button">
              Request New Reset Link
            </Button>
          </Link>
        </FormContainer>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Set New Password"
        subtitle="Create a strong password for your account"
        footer={footer}
        onSubmit={handleSubmit}
      >
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleInputChange('password')}
          required
          error={validationErrors.password}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          required
          error={validationErrors.confirmPassword}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMSetNewPassword;
