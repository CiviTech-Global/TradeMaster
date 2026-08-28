import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { signin, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMSignin: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
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
      errors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('emailInvalid');
    }

    if (!formData.password.trim()) {
      errors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('passwordMinLength');
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
    <AuthLayout title={t('welcomeBack')} subtitle={t('signInSubtitle')}>
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

        <TMInput
          label={commonT('email')}
          type="email"
          placeholder={t('enterEmail')}
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          error={validationErrors.email}
        />
        <TMInput
          label={commonT('password')}
          type="password"
          placeholder={t('enterPassword')}
          value={formData.password}
          onChange={handleInputChange('password')}
          required
          error={validationErrors.password}
        />

        <div style={{ textAlign: 'end' }}>
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-sm)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            {t('forgotPasswordLink')}
          </Link>
        </div>

        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {t('signInButton')}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        {t('dontHaveAccount')}{' '}
        <Link
          to="/signup"
          style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          {commonT('signUp')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSignin;
