import React, { useState, useCallback } from 'react';
import { TradeMasterMap } from '../../../components';
import type { TradingDataPoint, UserLocation, StaticLocation, MapOverlay, MapPosition } from '../../../components/Map/types';

const TMHome: React.FC = () => {
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

  // Sample User Locations
  const [userLocations] = useState<UserLocation[]>([
    {
      id: 'user-1',
      position: { lat: 40.7831, lng: -73.9712 }, // Central Park
      name: 'My Home Office',
      type: 'home',
      description: 'Primary trading location with full setup'
    },
    {
      id: 'user-2',
      position: { lat: 40.7282, lng: -74.0776 }, // Wall Street
      name: 'Financial District Office',
      type: 'office',
      description: 'Secondary office near major exchanges'
    },
    {
      id: 'user-3',
      position: { lat: 40.7488, lng: -73.9857 }, // Herald Square
      name: 'Favorite Coffee Shop',
      type: 'favorite',
      description: 'Great place for market analysis'
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
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Trading Map</h1>
        <p className="dashboard-page__subtitle">Real-time trading data and market locations</p>
      </div>
      <div className="dashboard-page__content">
        <TradeMasterMap
          center={{ lat: 40.7489, lng: -73.9680 }}
          zoom={12}
          height="calc(100vh - 200px)"
          tradingData={tradingData}
          userLocations={userLocations}
          staticLocations={staticLocations}
          overlays={overlays}
          onLocationFound={handleLocationFound}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
};

export default TMHome;