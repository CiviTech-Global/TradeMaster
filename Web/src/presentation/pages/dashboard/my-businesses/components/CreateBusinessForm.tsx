import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../../../components';
import { businessService } from '../../../../../infrastructure/api/businessService';
import type { BusinessFormData } from '../../../../../domain/types/business';
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
  const [formData, setFormData] = useState<BusinessFormData>({
    title: '',
    longitude: 0,
    latitude: 0,
    address: '',
    emails: [''],
    phones: [''],
    is_active: true,
    logo: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (selectedLocation && !isEditing) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }));
    }
  }, [selectedLocation, isEditing]);

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

    if (!selectedLocation && !isEditing) {
      setErrors(['Please select a location on the map']);
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
      await onSubmit({
        ...formData,
        emails: formData.emails.filter(email => email.trim()),
        phones: formData.phones.filter(phone => phone.trim())
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(['Failed to save business. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-business-form">
      <div className="form-section">
        <h4>Business Information</h4>

        <div className="form-row">
          <Input
            label="Business Title"
            type="text"
            placeholder="Enter business title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <textarea
            className="form-textarea"
            placeholder="Business Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="form-row">
          <Input
            label="Logo URL (Optional)"
            type="url"
            placeholder="https://example.com/logo.png"
            value={formData.logo}
            onChange={(e) => handleInputChange('logo', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
            />
            Business is active
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4>Contact Information</h4>

        <div className="form-subsection">
          <div className="form-subsection-header">
            <h5>Email Addresses</h5>
            <Button type="button" variant="secondary" onClick={addEmailField}>
              Add Email
            </Button>
          </div>
          {formData.emails.map((email, index) => (
            <div key={index} className="form-row-with-remove">
              <Input
                label={`Email ${index + 1}`}
                type="email"
                placeholder={`Enter email address ${index + 1}`}
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
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="form-subsection">
          <div className="form-subsection-header">
            <h5>Phone Numbers</h5>
            <Button type="button" variant="secondary" onClick={addPhoneField}>
              Add Phone
            </Button>
          </div>
          {formData.phones.map((phone, index) => (
            <div key={index} className="form-row-with-remove">
              <Input
                label={`Phone ${index + 1}`}
                type="tel"
                placeholder={`Enter phone number ${index + 1}`}
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
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Location</h4>
        <div className="location-info">
          <div className="form-row">
            <label className="input-label">Latitude</label>
            <input
              className="input-field"
              type="number"
              placeholder="Latitude"
              value={formData.latitude.toString()}
              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
              step="any"
              required
              readOnly={!isEditing}
            />
          </div>
          <div className="form-row">
            <label className="input-label">Longitude</label>
            <input
              className="input-field"
              type="number"
              placeholder="Longitude"
              value={formData.longitude.toString()}
              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
              step="any"
              required
              readOnly={!isEditing}
            />
          </div>
          {!selectedLocation && !isEditing && (
            <p className="location-hint">Please select a location on the map above</p>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          <h5>Please fix the following errors:</h5>
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
          disabled={isSubmitting || (!selectedLocation && !isEditing)}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Business' : 'Create Business')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateBusinessForm;