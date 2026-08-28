import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { changePassword, clearError, signout, selectUser, selectAuthLoading, selectAuthError } from '../../../../application/redux';
import { TMButton, TMInput, ThemeToggle } from '../../../components';
import { serverUrlConfig } from '../../../../infrastructure/api/serverUrlConfig';
import { networkService } from '../../../../infrastructure/api/NetworkService';
import { devService } from '../../../../infrastructure/api/devService';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../../../infrastructure/i18n/i18n';
import { formatDate } from '../../../../infrastructure/i18n/format';
import './Settings.css';

const TMSettings: React.FC = () => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'settings' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [serverUrl, setServerUrl] = useState(serverUrlConfig.getUrl());
  const [serverUrlSaved, setServerUrlSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setServerUrl(serverUrlConfig.getUrl());
  }, []);

  const handleServerUrlSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = serverUrlConfig.sanitize(serverUrl);
    serverUrlConfig.setUrl(sanitized);
    networkService.setBaseURL(sanitized);
    setServerUrl(sanitized);
    setServerUrlSaved(true);
    setTimeout(() => setServerUrlSaved(false), 3000);
  };

  const handleSeedDemoData = async () => {
    if (!window.confirm(t('demoDataConfirm'))) {
      return;
    }
    setSeeding(true);
    setSeedMessage('');
    try {
      const result = await devService.seedDemoData();
      setSeedMessage(result.message || t('demoDataSuccess'));
    } catch (error) {
      setSeedMessage(t('demoDataFailed'));
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMessage(''), 5000);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear messages
    if (error) dispatch(clearError());
    if (successMessage) setSuccessMessage('');
  };

  const validatePasswordForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = t('currentPasswordRequired');
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = t('newPasswordRequired');
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = t('newPasswordMinLength');
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })).unwrap();

      setSuccessMessage(t('passwordUpdated'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(t('deleteAccountConfirm'));
    if (!confirmed) return;

    setDeleting(true);
    try {
      await networkService.delete(`/users/${user.id}`);
      dispatch(signout());
      navigate('/signin');
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert(t('deleteAccountFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-page settings-page fade-in">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">{t('title')}</h1>
        <p className="dashboard-page__subtitle">{t('subtitle')}</p>
      </div>

      <div className="dashboard-page__content">
        {/* User Profile Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('profileInformation')}</h3>
          <div className="settings-profile">
            <div className="settings-profile__avatar">
              {user?.firstname?.[0]}{user?.lastname?.[0]}
            </div>
            <div className="settings-profile__info">
              <div className="settings-profile__field">
                <label>{commonT('name')}</label>
                <span>{user?.firstname} {user?.lastname}</span>
              </div>
              <div className="settings-profile__field">
                <label>{commonT('email')}</label>
                <span dir="ltr">{user?.email}</span>
              </div>
              <div className="settings-profile__field">
                <label>{commonT('memberSince')}</label>
                <span>{user?.createdAt ? formatDate(user.createdAt) : commonT('notAvailable')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('language')}</h3>
          <p className="settings-section__description">
            {t('languageDescription')}
          </p>
          <div className="settings-language-options">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`settings-language-btn ${i18n.language === lang ? 'settings-language-btn--active' : ''}`}
              >
                {lang === 'fa' ? commonT('languageFa') : commonT('languageEn')}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('appearance')}</h3>
          <p className="settings-section__description">
            {t('appearanceDescription')}
          </p>
          <ThemeToggle />
        </div>

        {/* Server Connection Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('serverConnection')}</h3>
          <p className="settings-section__description">
            {t('serverConnectionDescription')}
          </p>
          <form onSubmit={handleServerUrlSave} className="settings-form">
            {serverUrlSaved && (
              <div className="settings-message settings-message--success">
                {commonT('serverUrlSaved')}
              </div>
            )}
            <TMInput
              label={commonT('serverUrl')}
              type="url"
              placeholder={commonT('serverUrlPlaceholder')}
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              required
            />
            <div className="settings-form__actions">
              <TMButton type="submit">{commonT('saveServerUrl')}</TMButton>
            </div>
          </form>
        </div>

        {/* Demo Data Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('demoData')}</h3>
          <p className="settings-section__description">
            {t('demoDataDescription')}
          </p>
          {seedMessage && (
            <div className={`settings-message ${seedMessage.includes(t('demoDataFailed').slice(0, 10)) ? 'settings-message--error' : 'settings-message--success'}`}>
              {seedMessage}
            </div>
          )}
          <TMButton
            onClick={handleSeedDemoData}
            disabled={seeding}
            variant="secondary"
          >
            {seeding ? t('populating') : t('populateDemoData')}
          </TMButton>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('security')}</h3>

          {!showPasswordForm ? (
            <div className="settings-action">
              <p>{t('securityDescription')}</p>
              <TMButton
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                {t('changePassword')}
              </TMButton>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              {successMessage && (
                <div className="settings-message settings-message--success">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="settings-message settings-message--error">
                  {error}
                </div>
              )}

              <TMInput
                label={t('currentPassword')}
                type="password"
                placeholder={t('currentPasswordPlaceholder')}
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                required
                error={validationErrors.currentPassword}
              />

              <TMInput
                label={t('newPassword')}
                type="password"
                placeholder={t('newPasswordPlaceholder')}
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                required
                error={validationErrors.newPassword}
              />

              <TMInput
                label={t('confirmNewPassword')}
                type="password"
                placeholder={t('confirmNewPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                error={validationErrors.confirmPassword}
              />

              <div className="settings-form__actions">
                <TMButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setValidationErrors({});
                    dispatch(clearError());
                    setSuccessMessage('');
                  }}
                >
                  {commonT('cancel')}
                </TMButton>
                <TMButton type="submit" disabled={isLoading}>
                  {isLoading ? commonT('updating') : t('changePassword')}
                </TMButton>
              </div>
            </form>
          )}
        </div>

        {/* Account Deletion Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">{t('deleteAccount')}</h3>
          <p className="settings-section__description">
            {t('deleteAccountDescription')}
          </p>
          <TMButton
            onClick={handleDeleteAccount}
            disabled={deleting}
            variant="secondary"
          >
            {deleting ? t('deleting') : t('deleteAccount')}
          </TMButton>
        </div>
      </div>

    </div>
  );
};

export default TMSettings;
