import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../../../components';
import { businessService } from '../../../../../infrastructure/api/businessService';
import { categoryService } from '../../../../../infrastructure/api/categoryService';
import type { BusinessFormData } from '../../../../../domain/types/business';
import type { Category } from '../../../../../domain/types/category';
import type { MapPosition } from '../../../../components/Map/types';

interface CreateBusinessFormProps {
  selectedLocation: MapPosition | null;
  initialData?: BusinessFormData;
  onSubmit: (data: BusinessFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const CreateBusinessForm: React.FC<CreateBusinessFormProps> = ({
  selectedLocation,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'createBusinessForm' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const { t: mbT } = useTranslation('translation', { keyPrefix: 'myBusinesses' });
  const [formData, setFormData] = useState<BusinessFormData>({
    title: '',
    longitude: 0,
    latitude: 0,
    address: '',
    emails: [''],
    phones: [''],
    is_active: true,
    logo: '',
    description: '',
    category_id: null,
    cover_image: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }));
    }
  }, [initialData, selectedLocation]);

  // Update form data when location changes
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }));
    }
  }, [selectedLocation]);

  const handleInputChange = (field: keyof BusinessFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData(prev => ({ ...prev, emails: newEmails }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    if (formData.emails.length > 1) {
      const newEmails = formData.emails.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, emails: newEmails }));
    }
  };

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, '']
    }));
  };

  const removePhoneField = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !selectedLocation) {
      setErrors([mbT('locationRequired')]);
      return;
    }

    // For editing, ensure we have valid coordinates
    if (isEditing && (!formData.latitude || !formData.longitude)) {
      setErrors([mbT('coordinatesRequired')]);
      return;
    }

    // Validate form data
    const validationErrors = businessService.validateBusinessData({
      ...formData,
      emails: formData.emails.filter(email => email.trim()),
      phones: formData.phones.filter(phone => phone.trim())
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        // Ensure coordinates are numbers
        latitude: typeof formData.latitude === 'number' ? formData.latitude : parseFloat(formData.latitude.toString()),
        longitude: typeof formData.longitude === 'number' ? formData.longitude : parseFloat(formData.longitude.toString()),
        emails: formData.emails.filter(email => email.trim()),
        phones: formData.phones.filter(phone => phone.trim())
      };

      console.log('Submitting business data:', submitData);
      await onSubmit(submitData);

      // If we reach here, the submission was successful
      // The parent component will handle success feedback and form closure
    } catch (error) {
      console.error('Form submission error:', error);

      // Extract error message from API response or use default
      let errorMessage = mbT('saveFailed');

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      }

      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-business-form">
      <div className="form-section">
        <h4>{t('businessInformation')}</h4>

        <div className="form-row">
          <Input
            label={t('businessTitle')}
            type="text"
            placeholder={t('businessTitlePlaceholder')}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <textarea
            className="form-textarea"
            placeholder={t('addressPlaceholder')}
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="form-row">
          <label className="input-label">{t('descriptionOptional')}</label>
          <textarea
            className="form-textarea"
            placeholder={t('descriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-row">
          <label className="input-label">{t('category')}</label>
          <select
            className="input-field"
            value={formData.category_id || ''}
            onChange={(e) => handleInputChange('category_id', e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">{commonT('selectCategory')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <Input
            label={t('logoUrlOptional')}
            type="url"
            placeholder={t('logoUrlPlaceholder')}
            value={formData.logo}
            onChange={(e) => handleInputChange('logo', e.target.value)}
          />
        </div>

        <div className="form-row">
          <Input
            label={t('coverImageUrlOptional')}
            type="url"
            placeholder={t('coverImageUrlPlaceholder')}
            value={formData.cover_image}
            onChange={(e) => handleInputChange('cover_image', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
            />
            {t('businessIsActive')}
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4>{t('contactInformation')}</h4>

        <div className="form-subsection">
          <div className="form-subsection-header">
            <h5>{t('emailAddresses')}</h5>
            <Button type="button" variant="secondary" onClick={addEmailField}>
              {t('addEmail')}
            </Button>
          </div>
          {formData.emails.map((email, index) => (
            <div key={index} className="form-row-with-remove">
              <Input
                label={t('emailLabel', { index: index + 1 })}
                type="email"
                placeholder={t('emailPlaceholder', { index: index + 1 })}
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                required={index === 0}
              />
              {formData.emails.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeEmailField(index)}
                >
                  {commonT('remove')}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="form-subsection">
          <div className="form-subsection-header">
            <h5>{t('phoneNumbers')}</h5>
            <Button type="button" variant="secondary" onClick={addPhoneField}>
              {t('addPhone')}
            </Button>
          </div>
          {formData.phones.map((phone, index) => (
            <div key={index} className="form-row-with-remove">
              <Input
                label={t('phoneLabel', { index: index + 1 })}
                type="tel"
                placeholder={t('phonePlaceholder', { index: index + 1 })}
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                required={index === 0}
              />
              {formData.phones.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removePhoneField(index)}
                >
                  {commonT('remove')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>{t('location')}</h4>
        <div className="location-info">
          <div className="form-row">
            <label className="input-label">{t('latitude')}</label>
            <input
              className="input-field"
              type="number"
              placeholder={t('latitude')}
              value={formData.latitude.toString()}
              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
              step="any"
              required
              readOnly={!isEditing}
            />
          </div>
          <div className="form-row">
            <label className="input-label">{t('longitude')}</label>
            <input
              className="input-field"
              type="number"
              placeholder={t('longitude')}
              value={formData.longitude.toString()}
              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
              step="any"
              required
              readOnly={!isEditing}
            />
          </div>
          {!selectedLocation && !isEditing && (
            <p className="location-hint">{t('locationHint')}</p>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          <h5>{mbT('fixErrors')}</h5>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || (!isEditing && !selectedLocation) || (isEditing && (!formData.latitude || !formData.longitude))}
        >
          {isSubmitting ? t('saving') : (isEditing ? t('updateBusiness') : t('createBusiness'))}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {commonT('cancel')}
        </Button>
      </div>
    </form>
  );
};

export default CreateBusinessForm;
