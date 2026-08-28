import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import type { MapProps, MapPosition, SearchResult } from './types';
import { formatDateTime, formatNumber } from '../../../infrastructure/i18n/format';
import './Map.css';

// Fix default markers in React Leaflet
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, symbol?: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin" style="background-color: ${color}">
        <div class="marker-symbol">${symbol || ''}</div>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
};

const tradingIcon = (type: 'buy' | 'sell' | 'neutral') => {
  const colors = { buy: 'var(--color-success)', sell: 'var(--color-error)', neutral: 'var(--color-muted)' };
  const symbols = { buy: '↗', sell: '↘', neutral: '•' };
  return createCustomIcon(colors[type], `<span class="icon-flip-rtl">${symbols[type]}</span>`);
};

const userIcon = (type: 'home' | 'office' | 'favorite') => {
  const colors = { home: 'var(--color-info)', office: '#8b5cf6', favorite: 'var(--color-warning)' };
  const symbols = { home: '🏠', office: '🏢', favorite: '⭐' };
  return createCustomIcon(colors[type], symbols[type]);
};

const staticIcon = (type: 'exchange' | 'bank' | 'financial_institution') => {
  const colors = { exchange: '#06b6d4', bank: '#84cc16', financial_institution: '#ec4899' };
  const symbols = { exchange: '📈', bank: '🏦', financial_institution: '🏛️' };
  return createCustomIcon(colors[type], symbols[type]);
};

// Location Detection Component
const LocationMarker: React.FC<{ onLocationFound?: (position: MapPosition) => void }> = ({ onLocationFound }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'map' });
  const [userPosition, setUserPosition] = useState<MapPosition | null>(null);
  const map = useMap();

  useMapEvents({
    locationfound(e) {
      const position = { lat: e.latlng.lat, lng: e.latlng.lng };
      setUserPosition(position);
      map.flyTo(e.latlng, map.getZoom());
      onLocationFound?.(position);
    },
  });

  useEffect(() => {
    // Only locate once when component mounts
    map.locate();
  }, []); // Empty dependency array to prevent continuous location requests

  return userPosition ? (
    <Marker position={[userPosition.lat, userPosition.lng]} icon={createCustomIcon('var(--color-error)', '📍')}>
      <Popup>{t('currentLocation')}</Popup>
    </Marker>
  ) : null;
};

// Search Component
const MapSearch: React.FC<{ onLocationSelect: (position: MapPosition) => void }> = ({ onLocationSelect }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'map' });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const map = useMap();

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]); // Remove searchLocations from dependencies to prevent infinite loop

  const handleResultSelect = (result: SearchResult) => {
    const position = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    map.flyTo([position.lat, position.lng], 13);
    onLocationSelect(position);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="map-search">
      <div className="map-search__input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="map-search__input"
        />
        {isLoading && <div className="map-search__loading">🔍</div>}
      </div>
      {results.length > 0 && (
        <div className="map-search__results">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleResultSelect(result)}
              className="map-search__result"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Map Controls Component
const MapControls: React.FC<{ onLocateUser: () => void }> = ({ onLocateUser }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'map' });
  return (
    <div className="map-controls">
      <button onClick={onLocateUser} className="map-control-btn" title={t('findMyLocation')}>
        📍
      </button>
    </div>
  );
};

// Overlay Components
const TradingHeatmap: React.FC<{ data: MapPosition[]; color: string; opacity: number }> = ({ data, color, opacity }) => {
  return (
    <>
      {data.map((point, index) => (
        <Circle
          key={index}
          center={[point.lat, point.lng]}
          radius={1000}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 0
          }}
        />
      ))}
    </>
  );
};

const TradingZone: React.FC<{ data: MapPosition[]; color: string; opacity: number }> = ({ data, color, opacity }) => {
  if (data.length < 3) return null;

  const positions: [number, number][] = data.map(point => [point.lat, point.lng]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 2
      }}
    />
  );
};

// Main Map Component
const TradeMasterMap: React.FC<MapProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to New York
  zoom = 10,
  height = '600px',
  tradingData = [],
  userLocations = [],
  staticLocations = [],
  overlays = [],
  onLocationFound,
  onMarkerClick
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'map' });
  const [map, setMap] = useState<L.Map | null>(null);

  const handleLocateUser = () => {
    if (map) {
      map.locate();
    }
  };

  const handleLocationSelect = (position: MapPosition) => {
    console.log('Location selected:', position);
  };

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker onLocationFound={onLocationFound} />

        {/* Trading Data Markers */}
        {tradingData.map((data) => (
          <Marker
            key={data.id}
            position={[data.position.lat, data.position.lng]}
            icon={tradingIcon(data.type)}
            eventHandlers={{
              click: () => onMarkerClick?.(data)
            }}
          >
            <Popup>
              <div className="trading-popup">
                <h3>{data.symbol}</h3>
                <p>{t('price')}: {formatNumber(data.price, { style: 'currency', currency: 'USD' })}</p>
                <p>{t('change')}: <span className={data.change >= 0 ? 'positive' : 'negative'}>
                  {data.change >= 0 ? '+' : ''}{formatNumber(data.change)}%
                </span></p>
                <p>{t('volume')}: {formatNumber(data.volume)}</p>
                <p>{t('time')}: {formatDateTime(data.timestamp, { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Markers */}
        {userLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.position.lat, location.position.lng]}
            icon={userIcon(location.type)}
            eventHandlers={{
              click: () => onMarkerClick?.(location)
            }}
          >
            <Popup>
              <div className="user-popup">
                <h3>{location.name}</h3>
                <p>{t('type')}: {location.type}</p>
                {location.description && <p>{location.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Static Location Markers */}
        {staticLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.position.lat, location.position.lng]}
            icon={staticIcon(location.type)}
            eventHandlers={{
              click: () => onMarkerClick?.(location)
            }}
          >
            <Popup>
              <div className="static-popup">
                <h3>{location.name}</h3>
                <p>{t('type')}: {location.type.replace('_', ' ')}</p>
                {location.description && <p>{location.description}</p>}
                {location.website && (
                  <a href={location.website} target="_blank" rel="noopener noreferrer">
                    {t('visitWebsite')}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Custom Overlays */}
        {overlays.map((overlay) => {
          if (overlay.type === 'heatmap') {
            return (
              <TradingHeatmap
                key={overlay.id}
                data={overlay.data}
                color={overlay.color}
                opacity={overlay.opacity}
              />
            );
          } else if (overlay.type === 'trading_zone') {
            return (
              <TradingZone
                key={overlay.id}
                data={overlay.data}
                color={overlay.color}
                opacity={overlay.opacity}
              />
            );
          }
          return null;
        })}

        <MapSearch onLocationSelect={handleLocationSelect} />
        <MapControls onLocateUser={handleLocateUser} />
      </MapContainer>
    </div>
  );
};

export default TradeMasterMap;