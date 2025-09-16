import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

const TMForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
  };

  const footer = (
    <p>
      Remember your password?{' '}
      <Link to="/signin">Back to sign in</Link>
    </p>
  );

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Forgot Password"
        subtitle="Enter your email to reset your password"
        footer={footer}
        onSubmit={handleSubmit}
      >
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <Button type="submit">
          Send Reset Link
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMForgotPassword;
