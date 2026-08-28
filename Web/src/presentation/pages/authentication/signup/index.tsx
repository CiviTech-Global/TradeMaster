import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../../../application/redux/hooks";
import { signup, clearError, selectAuthLoading, selectAuthError } from "../../../../application/redux";
import AuthLayout from "../../../components/AuthLayout";
import { TMButton, TMInput } from "../../../components";

const PRIVACY_POLICY_VERSION = "1.0.0";
const TERMS_VERSION = "1.0.0";

const TMSignup: React.FC = () => {
  const { t } = useTranslation("translation", { keyPrefix: "auth" });
  const { t: commonT } = useTranslation("translation", { keyPrefix: "common" });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    consentGiven: false,
  });

  const [validationErrors, setValidationErrors] = useState<{
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    consentGiven?: string;
  }>({});

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "consentGiven" ? e.target.checked : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
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

  const validatePasswordStrength = (password: string): string | null => {
    if (password.length < 8) {
      return t("passwordMinLength");
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return t("passwordStrength");
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.firstname.trim()) {
      errors.firstname = t("firstNameRequired");
    } else if (formData.firstname.trim().length < 2) {
      errors.firstname = t("firstNameMinLength");
    }

    if (!formData.lastname.trim()) {
      errors.lastname = t("lastNameRequired");
    } else if (formData.lastname.trim().length < 2) {
      errors.lastname = t("lastNameMinLength");
    }

    if (!formData.email.trim()) {
      errors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("emailInvalid");
    }

    const passwordError = validatePasswordStrength(formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (!formData.consentGiven) {
      errors.consentGiven = t("consentRequired");
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
        consent_given: true,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        terms_version: TERMS_VERSION,
      })).unwrap();

      navigate("/dashboard");
    } catch (error) {
      // Error is handled by Redux and displayed below.
    }
  };

  const renderConsentLabel = () => {
    const label = t("consentLabel");
    const parts = label.split(/(\[.*?\])/g);
    return (
      <span style={{ fontSize: "14px", lineHeight: "1.5" }}>
        {parts.map((part, index) => {
          if (part === `[${t("privacyPolicy")}]`) {
            return (
              <Link
                key={index}
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", fontWeight: 600 }}
              >
                {t("privacyPolicy")}
              </Link>
            );
          }
          if (part === `[${t("termsOfService")}]`) {
            return (
              <Link
                key={index}
                to="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", fontWeight: 600 }}
              >
                {t("termsOfService")}
              </Link>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <AuthLayout title={t("createAccountTitle")} subtitle={t("createAccountSubtitle")}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--color-error-mix-10)',
            border: '1px solid var(--color-error-mix-20)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <TMInput
            label={commonT("firstName")}
            type="text"
            placeholder={t("enterFirstName")}
            value={formData.firstname}
            onChange={handleInputChange("firstname")}
            required
            error={validationErrors.firstname}
          />
          <TMInput
            label={commonT("lastName")}
            type="text"
            placeholder={t("enterLastName")}
            value={formData.lastname}
            onChange={handleInputChange("lastname")}
            required
            error={validationErrors.lastname}
          />
        </div>
        <TMInput
          label={commonT("email")}
          type="email"
          placeholder={t("enterEmail")}
          value={formData.email}
          onChange={handleInputChange("email")}
          required
          error={validationErrors.email}
        />
        <TMInput
          label={commonT("password")}
          type="password"
          placeholder={t("createPassword")}
          value={formData.password}
          onChange={handleInputChange("password")}
          required
          error={validationErrors.password}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            border: validationErrors.consentGiven ? '1px solid var(--color-error)' : '1px solid transparent',
          }}
        >
          <input
            type="checkbox"
            checked={formData.consentGiven}
            onChange={handleInputChange("consentGiven")}
            style={{ marginTop: '4px' }}
          />
          {renderConsentLabel()}
        </label>
        {validationErrors.consentGiven && (
          <div style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '-0.5rem' }}>
            {validationErrors.consentGiven}
          </div>
        )}

        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {isLoading ? t("creating") : t("createAccount")}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        {t("alreadyHaveAccount")}{' '}
        <Link
          to="/signin"
          style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          {commonT("signIn")}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSignup;
