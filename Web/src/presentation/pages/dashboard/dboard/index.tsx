import React, { useState, useEffect, useCallback } from 'react';
import { TradeMasterMap } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import type { Business } from '../../../../domain/types/business';
import type { TradingDataPoint, UserLocation, StaticLocation, MapOverlay, MapPosition } from '../../../components/Map/types';

const DBoard: React.FC = () => {
  // State for businesses and loading
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

  // Load all businesses from the platform
  useEffect(() => {
    const loadAllBusinesses = async () => {
      try {
        setIsLoadingBusinesses(true);
        const allBusinesses = await businessService.getAllBusinesses();
        setBusinesses(allBusinesses);
      } catch (error) {
        console.error('Failed to load businesses:', error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    loadAllBusinesses();
  }, []);

  // Transform businesses to UserLocation format for the map
  const businessLocations: UserLocation[] = businesses
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
        id: `business-${business.id}`,
        position: { lat, lng },
        name: business.title,
        type: (business.is_active ? 'office' : 'favorite') as 'home' | 'office' | 'favorite',
        description: `${business.address}\nOwner: ${business.user?.firstname} ${business.user?.lastname}`
      };
    })
    .filter(location => location !== null) as UserLocation[];

  // Sample Trading Data - Real-time trading locations
  const [tradingData] = useState<TradingDataPoint[]>([
    {
      id: 'trade-1',
      position: { lat: 40.7589, lng: -73.9851 }, // Times Square, NYC
      symbol: 'AAPL',
      price: 182.45,
      change: 2.3,
      volume: 125000,
      timestamp: new Date(),
      type: 'buy'
    },
    {
      id: 'trade-2',
      position: { lat: 40.7505, lng: -73.9934 }, // NYSE
      symbol: 'GOOGL',
      price: 2847.92,
      change: -1.2,
      volume: 89000,
      timestamp: new Date(),
      type: 'sell'
    },
    {
      id: 'trade-3',
      position: { lat: 40.7614, lng: -73.9776 }, // NASDAQ
      symbol: 'MSFT',
      price: 378.85,
      change: 0.8,
      volume: 156000,
      timestamp: new Date(),
      type: 'neutral'
    },
    {
      id: 'trade-4',
      position: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      symbol: 'TSLA',
      price: 248.67,
      change: 4.7,
      volume: 298000,
      timestamp: new Date(),
      type: 'buy'
    },
    {
      id: 'trade-5',
      position: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      symbol: 'META',
      price: 487.23,
      change: -2.1,
      volume: 187000,
      timestamp: new Date(),
      type: 'sell'
    }
  ]);

  // Sample Static Locations - Financial Institutions
  const [staticLocations] = useState<StaticLocation[]>([
    {
      id: 'static-1',
      position: { lat: 40.7505, lng: -73.9934 }, // NYSE
      name: 'New York Stock Exchange',
      type: 'exchange',
      description: 'Primary US stock exchange',
      website: 'https://www.nyse.com'
    },
    {
      id: 'static-2',
      position: { lat: 40.7614, lng: -73.9776 }, // NASDAQ
      name: 'NASDAQ MarketSite',
      type: 'exchange',
      description: 'Electronic stock exchange',
      website: 'https://www.nasdaq.com'
    },
    {
      id: 'static-3',
      position: { lat: 40.7550, lng: -73.9840 }, // JP Morgan Chase
      name: 'JPMorgan Chase & Co.',
      type: 'bank',
      description: 'Major investment bank',
      website: 'https://www.jpmorganchase.com'
    },
    {
      id: 'static-4',
      position: { lat: 40.7484, lng: -73.9857 }, // Goldman Sachs
      name: 'Goldman Sachs',
      type: 'financial_institution',
      description: 'Investment banking and securities firm',
      website: 'https://www.goldmansachs.com'
    },
    {
      id: 'static-5',
      position: { lat: 40.7653, lng: -73.9749 }, // Federal Reserve Bank
      name: 'Federal Reserve Bank of NY',
      type: 'financial_institution',
      description: 'Central banking system',
      website: 'https://www.newyorkfed.org'
    }
  ]);

  // Sample Overlays - Trading zones and heatmaps
  const [overlays] = useState<MapOverlay[]>([
    {
      id: 'overlay-1',
      type: 'heatmap',
      data: [
        { lat: 40.7589, lng: -73.9851 },
        { lat: 40.7505, lng: -73.9934 },
        { lat: 40.7614, lng: -73.9776 },
        { lat: 40.7550, lng: -73.9840 },
        { lat: 40.7484, lng: -73.9857 }
      ],
      color: '#3b82f6',
      opacity: 0.3
    },
    {
      id: 'overlay-2',
      type: 'trading_zone',
      data: [
        { lat: 40.7489, lng: -73.9680 },
        { lat: 40.7614, lng: -73.9776 },
        { lat: 40.7505, lng: -73.9934 },
        { lat: 40.7400, lng: -73.9900 }
      ],
      color: '#10b981',
      opacity: 0.2
    }
  ]);

  const handleLocationFound = useCallback((position: MapPosition) => {
    console.log('User location found:', position);
  }, []);

  const handleMarkerClick = useCallback((data: TradingDataPoint | UserLocation | StaticLocation) => {
    console.log('Marker clicked:', data);

    // Show business details if it's a business marker
    if (data.id.startsWith('business-')) {
      const businessId = data.id.replace('business-', '');
      const business = businesses.find(b => b.id.toString() === businessId);

      if (business) {
        alert(`Business: ${business.title}\nOwner: ${business.user?.firstname} ${business.user?.lastname}\nAddress: ${business.address}\nStatus: ${business.is_active ? 'Active' : 'Inactive'}\nEmails: ${business.emails.join(', ')}\nPhones: ${business.phones.join(', ')}`);
      }
    }
  }, [businesses]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">TradeMaster Global Dashboard</h1>
        <p className="dashboard-page__subtitle">
          Comprehensive view of all platform businesses, trading data, and market locations
          {!isLoadingBusinesses && ` (${businessLocations.length} businesses • ${tradingData.length} active trades • ${staticLocations.length} institutions)`}
        </p>
      </div>
      <div className="dashboard-page__content">
        {isLoadingBusinesses ? (
          <div className="loading-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 200px)',
            fontSize: '18px',
            color: '#666'
          }}>
            <div>
              <div style={{ marginBottom: '10px' }}>🌍</div>
              Loading global business data...
            </div>
          </div>
        ) : (
          <TradeMasterMap
          center={businessLocations.length > 0
            ? businessLocations[0].position
            : { lat: 40.7489, lng: -73.9680 }
          }
          zoom={businessLocations.length > 0 ? 8 : 10}
          height="calc(100vh - 200px)"
          tradingData={tradingData}
          userLocations={businessLocations}
          staticLocations={staticLocations}
          overlays={overlays}
          onLocationFound={handleLocationFound}
          onMarkerClick={handleMarkerClick}
        />
        )}
      </div>
    </div>
  );
};

export default DBoard;