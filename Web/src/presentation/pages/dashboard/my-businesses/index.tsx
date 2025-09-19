import React, { useState, useEffect, useCallback } from 'react';
import { TradeMasterMap, Button, BusinessLocationMap } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business, BusinessFormData } from '../../../../domain/types/business';
import type { MapPosition } from '../../../components/Map/types';
import CreateBusinessForm from './components/CreateBusinessForm';
import BusinessTable from './components/BusinessTable';
import './MyBusinesses.css';

const MyBusinesses: React.FC = () => {
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
      alert('Business created successfully!');
    } catch (error) {
      console.error('Failed to create business:', error);
      alert('Failed to create business. Please try again.');
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
      alert('Business updated successfully!');
    } catch (error) {
      console.error('Failed to update business:', error);
      alert('Failed to update business. Please try again.');
      throw error;
    }
  };

  // Handle deleting a business
  const handleDeleteBusiness = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this business?')) {
      return;
    }

    try {
      const success = await businessService.deleteBusiness(id);
      if (success) {
        setBusinesses(prev => prev.filter(business => business.id !== id));
        alert('Business deleted successfully!');
      } else {
        alert('Failed to delete business. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('Failed to delete business. Please try again.');
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

  // Prepare map data for displaying businesses
  const businessMarkers = businesses
    .filter(business => business.latitude && business.longitude) // Filter out businesses without coordinates
    .map(business => {
      const lat = typeof business.latitude === 'number' ? business.latitude : parseFloat(business.latitude as string);
      const lng = typeof business.longitude === 'number' ? business.longitude : parseFloat(business.longitude as string);

      // Only include businesses with valid coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for business ${business.id}: lat=${business.latitude}, lng=${business.longitude}`);
        return null;
      }

      return {
        id: business.id.toString(),
        position: { lat, lng },
        name: business.title,
        type: (business.is_active ? 'office' : 'favorite') as 'home' | 'office' | 'favorite',
        description: business.address
      };
    })
    .filter(marker => marker !== null) as Array<{
      id: string;
      position: { lat: number; lng: number };
      name: string;
      type: 'home' | 'office' | 'favorite';
      description: string;
    }>;

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__header">
          <h1 className="dashboard-page__title">My Businesses</h1>
        </div>
        <div className="dashboard-page__content">
          <div className="loading-spinner">Loading your businesses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">My Businesses</h1>
        <p className="dashboard-page__subtitle">
          Manage your business locations and information
        </p>
        <div className="dashboard-page__actions">
          <Button
            variant="primary"
            onClick={() => {
              setEditingBusiness(null); // Clear any editing state
              setSelectedLocation(null); // Clear any selected location
              setShowCreateForm(true);
            }}
          >
            Create a new business
          </Button>
        </div>
      </div>

      <div className="dashboard-page__content">
        {showCreateForm && (
          <div className="business-creation-section">
            <div className="business-creation__header">
              <h2>{editingBusiness ? 'Edit Business' : 'Create New Business'}</h2>
              <Button variant="secondary" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>

            <div className="business-creation__content">
              <div className="business-creation__map">
                <h3>Select Business Location</h3>
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
                    logo: editingBusiness.logo
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
            <div className="businesses-overview">
              <div className="businesses-overview__map">
                <h3>Businesses Overview</h3>
                <TradeMasterMap
                  center={businessMarkers.length > 0
                    ? businessMarkers[0].position
                    : { lat: 40.7128, lng: -74.0060 }
                  }
                  zoom={businesses.length > 0 ? 12 : 10}
                  height="300px"
                  userLocations={businessMarkers}
                />
              </div>
            </div>

            <div className="businesses-table-section">
              <h3>Businesses I Own ({businesses.length})</h3>
              <BusinessTable
                businesses={businesses}
                onEdit={handleEditBusiness}
                onDelete={handleDeleteBusiness}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBusinesses;