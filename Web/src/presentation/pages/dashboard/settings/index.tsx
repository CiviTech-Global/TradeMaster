import React, { useState } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import { Input, Button } from '../../../components';

const TMSettings: React.FC = () => {
  const { user, changePassword, isLoading, error, clearError } = useAuthContext();
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
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const validatePasswordForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccessMessage('Password updated successfully');
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Settings</h1>
        <p className="dashboard-page__subtitle">Manage your profile and account settings</p>
      </div>

      <div className="dashboard-page__content">
        {/* User Profile Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">Profile Information</h3>
          <div className="settings-profile">
            <div className="settings-profile__avatar">
              {user?.firstname?.[0]}{user?.lastname?.[0]}
            </div>
            <div className="settings-profile__info">
              <div className="settings-profile__field">
                <label>Name</label>
                <span>{user?.firstname} {user?.lastname}</span>
              </div>
              <div className="settings-profile__field">
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
              <div className="settings-profile__field">
                <label>Member since</label>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <h3 className="settings-section__title">Security</h3>

          {!showPasswordForm ? (
            <div className="settings-action">
              <p>Keep your account secure by using a strong password.</p>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </Button>
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

              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                required
                error={validationErrors.currentPassword}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                required
                error={validationErrors.newPassword}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                error={validationErrors.confirmPassword}
              />

              <div className="settings-form__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setValidationErrors({});
                    clearError();
                    setSuccessMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .settings-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .settings-section:last-child {
          border-bottom: none;
        }

        .settings-section__title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1.5rem 0;
        }

        .settings-profile {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .settings-profile__avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.5rem;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .settings-profile__info {
          flex: 1;
        }

        .settings-profile__field {
          margin-bottom: 1rem;
        }

        .settings-profile__field label {
          display: block;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .settings-profile__field span {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .settings-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .settings-action p {
          color: #6b7280;
          margin: 0;
          flex: 1;
        }

        .settings-form {
          max-width: 400px;
        }

        .settings-form__actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .settings-message {
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .settings-message--success {
          background-color: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .settings-message--error {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .settings-profile {
            flex-direction: column;
            text-align: center;
          }

          .settings-action {
            flex-direction: column;
            align-items: flex-start;
          }

          .settings-form__actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TMSettings;