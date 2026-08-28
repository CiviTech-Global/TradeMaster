import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { resetPassword, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMSetNewPassword: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });
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
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) dispatch(clearError());
  };

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!formData.password.trim()) {
      errors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('passwordMinLength');
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(resetPassword({
        token,
        newPassword: formData.password
      })).unwrap();

      navigate(`/signin?message=${encodeURIComponent(t('resetSuccessMessage'))}`);
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  if (!isValidToken) {
    return (
      <AuthLayout title={t('invalidResetLinkTitle')} subtitle={t('invalidResetLinkSubtitle')}>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--color-error-mix-10)',
          border: '1px solid var(--color-error-mix-20)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {t('invalidResetLinkMessage')}
        </div>
        <Link to="/forgot-password">
          <TMButton type="button" isFullWidth>
            {t('requestNewResetLink')}
          </TMButton>
        </Link>
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            {t('backToSignIn')}
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('setNewPasswordTitle')} subtitle={t('setNewPasswordSubtitle')}>
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
          label={t('newPassword')}
          type="password"
          placeholder={t('enterNewPassword')}
          value={formData.password}
          onChange={handleInputChange('password')}
          required
          error={validationErrors.password}
        />
        <TMInput
          label={t('confirmPassword')}
          type="password"
          placeholder={t('confirmNewPasswordPlaceholder')}
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          required
          error={validationErrors.confirmPassword}
        />
        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {isLoading ? t('updating') : t('updatePassword')}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          {t('backToSignIn')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMSetNewPassword;
