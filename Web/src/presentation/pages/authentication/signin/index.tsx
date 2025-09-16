import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

const TMSignin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signin attempt:', formData);
  };

  const footer = (
    <div>
      <p>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
      <p>
        Don't have an account?{' '}
        <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Sign in"
        subtitle="Welcome back to TradeMaster"
        footer={footer}
        onSubmit={handleSubmit}
      >
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          required
        />
        <Button type="submit">
          Sign in
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMSignin;
