import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TradeMasterMap } from '../../../components';
import { TMCard, TMSkeleton, TMEmptyState } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import { formatNumber } from '../../../../infrastructure/i18n/format';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business } from '../../../../domain/types/business';
import type { UserLocation, MapPosition } from '../../../components/Map/types';

const TMHome: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllBusinesses = async () => {
      try {
        setIsLoading(true);
        const allBusinesses = await businessService.getAllBusinesses();
        setBusinesses(allBusinesses);
      } catch (error) {
        console.error('Failed to load businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllBusinesses();
  }, []);

  const businessLocations: UserLocation[] = businesses
    .filter((business) => business.latitude && business.longitude)
    .map((business): UserLocation | null => {
      const lat = typeof business.latitude === 'number' ? business.latitude : parseFloat(business.latitude as string);
      const lng = typeof business.longitude === 'number' ? business.longitude : parseFloat(business.longitude as string);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        id: `business-${business.id}`,
        position: { lat, lng },
        name: business.title,
        type: business.is_active ? 'office' : 'favorite',
        description: business.address || '',
      };
    })
    .filter((location): location is UserLocation => location !== null);

  const myBusinesses = businesses.filter((b) => b.owner === user?.id);
  const recentBusinesses = businesses.slice(0, 5);

  const handleMarkerClick = useCallback((data: { id: string }) => {
    if (data.id.startsWith('business-')) {
      const businessId = data.id.replace('business-', '');
      navigate(`/dashboard/my-businesses?edit=${businessId}`);
    }
  }, [navigate]);

  const handleLocationFound = useCallback((position: MapPosition) => {
    console.log('User location found:', position);
  }, []);

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">{t('homeTitle')}</h1>
        <p className="dashboard-page__subtitle">
          {t('homeSubtitle')}
        </p>
      </div>

      <div className="dashboard-page__content">
        {/* Bento summary cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <SummaryCard
            label={t('totalBusinesses')}
            value={businesses.length}
            icon="🏪"
            color="var(--color-primary)"
          />
          <SummaryCard
            label={t('myBusinesses')}
            value={myBusinesses.length}
            icon="🏢"
            color="var(--color-secondary)"
          />
          <SummaryCard
            label={t('active')}
            value={businesses.filter((b) => b.is_active).length}
            icon="✅"
            color="var(--color-success)"
          />
        </div>

        {/* Map */}
        <TMCard style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 'var(--font-size-lg)' }}>
            {t('businessMap')}
          </h3>
          {isLoading ? (
            <TMSkeleton width="100%" height={400} />
          ) : businessLocations.length > 0 ? (
            <TradeMasterMap
              center={businessLocations[0]?.position || { lat: 40.7489, lng: -73.968 }}
              zoom={businessLocations.length > 0 ? 10 : 12}
              height="400px"
              userLocations={businessLocations}
              onLocationFound={handleLocationFound}
              onMarkerClick={handleMarkerClick}
            />
          ) : (
            <TMEmptyState
              icon="🗺️"
              title={t('noBusinessesOnMap')}
              subtitle={t('registerBusinessToSee')}
            />
          )}
        </TMCard>

        {/* Recent businesses */}
        <h3 style={{ margin: '0 0 1rem', fontSize: 'var(--font-size-lg)' }}>
          {t('recentlyAdded')}
        </h3>
        {isLoading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <TMSkeleton key={i} width="100%" height={72} />
            ))}
          </div>
        ) : recentBusinesses.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentBusinesses.map((business) => (
              <BusinessRow key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <TMEmptyState
            icon="🏪"
            title={t('noBusinessesYet')}
            subtitle={t('addFirstBusiness')}
            actionLabel={commonT('createBusiness')}
            onAction={() => navigate('/dashboard/my-businesses')}
          />
        )}
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => {
  return (
    <TMCard style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 800,
              color: 'var(--color-on-surface)',
            }}
          >
            {formatNumber(value)}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
            {label}
          </div>
        </div>
      </div>
    </TMCard>
  );
};

const BusinessRow: React.FC<{ business: Business }> = ({ business }) => {
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const navigate = useNavigate();
  return (
    <TMCard
      onClick={() => navigate(`/dashboard/my-businesses?edit=${business.id}`)}
      style={{ padding: '1rem', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-on-primary)',
            fontWeight: 700,
          }}
        >
          {business.title[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
            {business.title}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {business.address || business.category?.name || commonT('noDetails')}
          </div>
        </div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            background: business.is_active ? 'var(--color-success-bg)' : 'var(--color-border)',
            color: business.is_active ? 'var(--color-success)' : 'var(--color-muted)',
          }}
        >
          {business.is_active ? commonT('active') : commonT('inactive')}
        </span>
      </div>
    </TMCard>
  );
};

export default TMHome;
