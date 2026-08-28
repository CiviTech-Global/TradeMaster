import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { forgotPassword, clearError, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import AuthLayout from '../../../components/AuthLayout';
import { TMButton, TMInput } from '../../../components';

const TMForgotPassword: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) setValidationError('');
    if (error) dispatch(clearError());
  };

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setValidationError(t('emailRequired'));
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError(t('emailInvalid'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await dispatch(forgotPassword({ email: email.trim() })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title={t('checkEmailTitle')} subtitle={t('checkEmailSubtitle')}>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--color-success-mix-10)',
          border: '1px solid var(--color-success-mix-20)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-success)',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <Trans i18nKey="auth.resetLinkSent" values={{ email }}>
            A password reset link has been sent to <strong>{{ email }}</strong>.
          </Trans>
        </div>
        <p style={{ textAlign: 'center' }}>
          <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            {t('backToSignIn')}
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('forgotPasswordTitle')} subtitle={t('forgotPasswordSubtitle')}>
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
          placeholder={t('enterEmailAddress')}
          value={email}
          onChange={handleEmailChange}
          required
          error={validationError}
        />
        <TMButton type="submit" isLoading={isLoading} isFullWidth>
          {t('sendResetLink')}
        </TMButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
        {t('rememberPassword')}{' '}
        <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          {commonT('signIn')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default TMForgotPassword;
