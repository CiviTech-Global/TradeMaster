import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../../application/redux/hooks";
import { signup, clearError, selectAuthLoading, selectAuthError } from "../../../../application/redux";
import AuthLayout from "../../../components/AuthLayout";
import { TMButton, TMInput } from "../../../components";

const TMSignup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
  }>({});

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }

      if (error) {
        dispatch(clearError());
      }
    };

  const validateForm = (): boolean => {
    const errors: {
      firstname?: string;
      lastname?: string;
      email?: string;
      password?: string;
    } = {};

    if (!formData.firstname.trim()) {
      errors.firstname = "First name is required";
    } else if (formData.firstname.trim().length < 2) {
      errors.firstname = "First name must be at least 2 characters long";
    }

    if (!formData.lastname.trim()) {
      errors.lastname = "Last name is required";
    } else if (formData.lastname.trim().length < 2) {
      errors.lastname = "Last name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
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
      await dispatch(signup({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })).unwrap();

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join the local business directory">
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <TMInput
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstname}
            onChange={handleInputChange("firstname")}
            required
            error={validationErrors.firstname}
          />
          <TMInput
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastname}
            onChange={handleInputChange("lastname")}
            required
            error={validationErrors.lastname}
          />
        </div>
        <TMInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange("email")}
          required
          error={validationErrors.email}
        />
        <TMInput
          label="Password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange("password")}
          required
          error={validationErrors.password}
        />

        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {isLoading ? "Creating account..." : "Create Account"}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        Already have an account?{' '}
        <Link
          to="/signin"
          style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSignup;
