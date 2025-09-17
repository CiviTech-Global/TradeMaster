import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

const TMForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError('');
    }

    // Clear auth errors
    if (error) {
      clearError();
    }
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

    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.error('Forgot password failed:', error);
    }
  };

  const footer = (
    <p>
      Remember your password?{' '}
      <Link to="/signin">Back to sign in</Link>
    </p>
  );

  if (isSubmitted) {
    return (
      <AuthLayout illustration={<AuthIllustration />}>
        <FormContainer
          title="Check Your Email"
          subtitle="We've sent a password reset link to your email address"
          footer={footer}
        >
          <div style={{
            padding: '16px',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            A password reset link has been sent to <strong>{email}</strong>.
            Please check your email and follow the instructions to reset your password.
          </div>
        </FormContainer>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Forgot Password"
        subtitle="Enter your email to reset your password"
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
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          required
          error={validationError}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMForgotPassword;
