import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import AuthLayout from "../../../components/AuthLayout";
import FormContainer from "../../../components/FormContainer";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import AuthIllustration from "../../../components/AuthIllustration";

const TMSignup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthContext();

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

      // Clear validation errors when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }

      // Clear auth errors
      if (error) {
        clearError();
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
      await signup({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Navigate to dashboard on successful signup
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.error("Signup failed:", error);
    }
  };

  const footer = (
    <p>
      Already have an account? <Link to="/signin">Sign in</Link>
    </p>
  );

  return (
    <AuthLayout illustration={<AuthIllustration />}>
      <FormContainer title="Sign up" footer={footer} onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstname}
          onChange={handleInputChange("firstname")}
          required
          error={validationErrors.firstname}
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastname}
          onChange={handleInputChange("lastname")}
          required
          error={validationErrors.lastname}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange("email")}
          required
          error={validationErrors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange("password")}
          required
          error={validationErrors.password}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up →"}
        </Button>
      </FormContainer>
    </AuthLayout>
  );
};

export default TMSignup;
