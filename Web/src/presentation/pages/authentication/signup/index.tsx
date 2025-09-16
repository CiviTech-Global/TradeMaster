import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

const TMSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
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
    console.log('Signup attempt:', formData);
  };

  const footer = (
    <p>
      Already have an account?{' '}
      <Link to="/signin">Sign in</Link>
    </p>
  );

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Sign up"
        footer={footer}
        onSubmit={handleSubmit}
      >
        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstname}
          onChange={handleInputChange('firstname')}
          required
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastname}
          onChange={handleInputChange('lastname')}
          required
        />
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
          Sign up →
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMSignup;
