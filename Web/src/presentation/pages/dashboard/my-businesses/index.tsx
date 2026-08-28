import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BusinessLocationMap } from '../../../components';
import { TMButton, TMEmptyState } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business, BusinessFormData } from '../../../../domain/types/business';
import type { MapPosition } from '../../../components/Map/types';
import CreateBusinessForm from './components/CreateBusinessForm';
import BusinessTable from './components/BusinessTable';
import './MyBusinesses.css';

const MyBusinesses: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'myBusinesses' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapPosition | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const user = useAppSelector(selectUser);

  // Load user's businesses
  const loadBusinesses = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userBusinesses = await businessService.getBusinessesByOwner(user.id);
      setBusinesses(userBusinesses);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Handle creating a new business
  const handleCreateBusiness = async (businessData: BusinessFormData) => {
    if (!user?.id) return;

    try {
      const newBusiness = await businessService.createBusiness({
        ...businessData,
        owner: user.id
      });
      setBusinesses(prev => [...prev, newBusiness]);
      setShowCreateForm(false);
      setSelectedLocation(null);

      // Show success message
      alert(t('businessCreated'));
    } catch (error) {
      console.error('Failed to create business:', error);
      alert(t('createFailed'));
      throw error;
    }
  };

  // Handle updating a business
  const handleUpdateBusiness = async (id: number, businessData: Partial<BusinessFormData>) => {
    try {
      const updatedBusiness = await businessService.updateBusiness(id, businessData);
      setBusinesses(prev =>
        prev.map(business =>
          business.id === id ? updatedBusiness : business
        )
      );

      // Close the form and reset state
      setEditingBusiness(null);
      setShowCreateForm(false);
      setSelectedLocation(null);

      // Show success message
      alert(t('businessUpdated'));
    } catch (error) {
      console.error('Failed to update business:', error);
      alert(t('updateFailed'));
      throw error;
    }
  };

  // Handle deleting a business
  const handleDeleteBusiness = async (id: number) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const success = await businessService.deleteBusiness(id);
      if (success) {
        setBusinesses(prev => prev.filter(business => business.id !== id));
        alert(t('businessDeleted'));
      } else {
        alert(t('deleteFailed'));
      }
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert(t('deleteFailed'));
    }
  };

  // Handle editing a business
  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setSelectedLocation({
      lat: typeof business.latitude === 'number' ? business.latitude : parseFloat(business.latitude as string),
      lng: typeof business.longitude === 'number' ? business.longitude : parseFloat(business.longitude as string)
    });
    setShowCreateForm(true);
  };

  // Handle location selection on map
  const handleLocationFound = useCallback((position: MapPosition) => {
    setSelectedLocation(position);
  }, []);

  // Handle cancelling create/edit form
  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingBusiness(null);
    setSelectedLocation(null);
  };


  if (isLoading) {
    return (
      <div className="dashboard-page fade-in">
        <div className="dashboard-page__header">
          <h1 className="dashboard-page__title">{t('title')}</h1>
        </div>
        <div className="dashboard-page__content">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '64px', background: 'var(--color-border)', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">{t('title')}</h1>
        <p className="dashboard-page__subtitle">
          {t('subtitle')}
        </p>
        <div className="dashboard-page__actions">
          <TMButton
            onClick={() => {
              setEditingBusiness(null);
              setSelectedLocation(null);
              setShowCreateForm(true);
            }}
          >
            {t('createBusiness')}
          </TMButton>
        </div>
      </div>

      <div className="dashboard-page__content">
        {showCreateForm && (
          <div className="business-creation-section">
            <div className="business-creation__header">
              <h2>{editingBusiness ? t('editBusiness') : t('createNewBusiness')}</h2>
              <TMButton variant="outline" onClick={handleCancelForm}>
                {commonT('cancel')}
              </TMButton>
            </div>

            <div className="business-creation__content">
              <div className="business-creation__map">
                <h3>{t('selectLocation')}</h3>
                <BusinessLocationMap
                  center={selectedLocation || { lat: 40.7128, lng: -74.0060 }}
                  zoom={selectedLocation ? 15 : 10}
                  height="400px"
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationFound}
                  existingBusinesses={businesses.map(b => ({
                    lat: typeof b.latitude === 'number' ? b.latitude : parseFloat(b.latitude as string),
                    lng: typeof b.longitude === 'number' ? b.longitude : parseFloat(b.longitude as string)
                  })).filter(pos => !isNaN(pos.lat) && !isNaN(pos.lng))}
                />
              </div>

              <div className="business-creation__form">
                <CreateBusinessForm
                  selectedLocation={selectedLocation}
                  initialData={editingBusiness ? {
                    title: editingBusiness.title,
                    longitude: editingBusiness.longitude,
                    latitude: editingBusiness.latitude,
                    address: editingBusiness.address,
                    emails: editingBusiness.emails,
                    phones: editingBusiness.phones,
                    is_active: editingBusiness.is_active,
                    logo: editingBusiness.logo,
                    description: editingBusiness.description || '',
                    category_id: editingBusiness.category_id,
                    cover_image: editingBusiness.cover_image || '',
                  } : undefined}
                  onSubmit={editingBusiness
                    ? (data) => handleUpdateBusiness(editingBusiness.id, data)
                    : handleCreateBusiness
                  }
                  onCancel={handleCancelForm}
                  isEditing={!!editingBusiness}
                />
              </div>
            </div>
          </div>
        )}

        {!showCreateForm && (
          <div className="businesses-section">
            <div className="businesses-table-section">
              <div className="businesses-header">
                <h3>{t('businessesIOwn', { count: businesses.length })}</h3>
                <p className="businesses-subtitle">
                  {t('businessesSubtitle')}
                </p>
              </div>
              {businesses.length === 0 ? (
                <TMEmptyState
                  icon="🏪"
                  title={t('noBusinessesYet')}
                  subtitle={t('createFirstBusiness')}
                  actionLabel={commonT('createBusiness')}
                  onAction={() => {
                    setEditingBusiness(null);
                    setSelectedLocation(null);
                    setShowCreateForm(true);
                  }}
                />
              ) : (
                <BusinessTable
                  businesses={businesses}
                  onEdit={handleEditBusiness}
                  onDelete={handleDeleteBusiness}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBusinesses;
