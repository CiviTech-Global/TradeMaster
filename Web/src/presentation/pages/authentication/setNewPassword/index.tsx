import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../components/AuthLayout';
import FormContainer from '../../../components/FormContainer';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AuthIllustration from '../../../components/AuthIllustration';

const TMSetNewPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
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
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('New password set');
  };

  const footer = (
    <p>
      <Link to="/signin">Back to sign in</Link>
    </p>
  );

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer
        title="Set New Password"
        subtitle="Create a strong password for your account"
        footer={footer}
        onSubmit={handleSubmit}
      >
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleInputChange('password')}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          required
        />
        <Button type="submit">
          Update Password
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMSetNewPassword;
