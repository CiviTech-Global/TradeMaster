import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../../application/redux/hooks';
import { selectUser, setUser } from '../../../../application/redux';
import { TMButton, TMInput } from '../../../components';
import { uploadService } from '../../../../infrastructure/api/uploadService';
import { networkService } from '../../../../infrastructure/api/NetworkService';
import './Profile.css';

const TMProfile: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: (user as any)?.phone || '',
    bio: (user as any)?.bio || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('fileSizeLimit') });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await uploadService.updateAvatar(user.id, file);
      dispatch(setUser({ ...user, avatar: avatarUrl } as any));
      setMessage({ type: 'success', text: t('avatarUpdated') });
    } catch (error) {
      setMessage({ type: 'error', text: t('avatarUploadFailed') });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await networkService.patch(`/users/${user.id}`, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone || null,
        bio: formData.bio || null,
      });
      dispatch(setUser({ ...user, ...response.data.data } as any));
      setMessage({ type: 'success', text: t('profileUpdated') });
    } catch (error) {
      setMessage({ type: 'error', text: t('profileUpdateFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const avatarUrl = (user as any).avatar
    ? uploadService.getFullUrl((user as any).avatar)
    : null;

  return (
    <div className="profile-page">
      <h2>{t('title')}</h2>

      {message && (
        <div className={`profile-message profile-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar" onClick={handleAvatarClick}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={t('avatarAlt')} className="profile-avatar__image" />
            ) : (
              <div className="profile-avatar__placeholder">
                {user.firstname?.[0]}{user.lastname?.[0]}
              </div>
            )}
            <div className="profile-avatar__overlay">
              {isUploadingAvatar ? t('uploading') : t('changeAvatar')}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <p className="profile-avatar__hint">{t('avatarHint')}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <TMInput
              label={t('firstName')}
              type="text"
              placeholder={t('firstNamePlaceholder')}
              value={formData.firstname}
              onChange={(e) => handleInputChange('firstname', e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <TMInput
              label={t('lastName')}
              type="text"
              placeholder={t('lastNamePlaceholder')}
              value={formData.lastname}
              onChange={(e) => handleInputChange('lastname', e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <TMInput
              label={commonT('phone')}
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="input-label">{t('bioLabel')}</label>
            <textarea
              className="form-textarea"
              placeholder={t('bioPlaceholder')}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-row">
            <TMInput
              label={commonT('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={user.email}
              onChange={() => {}}
              disabled
            />
          </div>
          <div className="form-actions">
            <TMButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? commonT('saving') : commonT('saveChanges')}
            </TMButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TMProfile;
