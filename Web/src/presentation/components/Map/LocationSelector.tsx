import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { MapPosition } from './types';
import './Map.css';

// Fix default markers in React Leaflet
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom business location icon
const businessLocationIcon = L.divIcon({
  className: 'custom-marker business-location-marker',
  html: `
    <div class="marker-pin" style="background-color: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <div class="marker-symbol" style="color: white; font-weight: bold;">🏢</div>
    </div>
  `,
  iconSize: [35, 45],
  iconAnchor: [17.5, 45],
  popupAnchor: [0, -45]
});

interface LocationSelectorProps {
  center?: MapPosition;
  zoom?: number;
  height?: string;
  selectedLocation?: MapPosition | null;
  onLocationSelect: (position: MapPosition) => void;
  existingBusinesses?: MapPosition[];
}

// User Location Detection Component
const LocationFinder: React.FC<{
  onLocationFound: (position: MapPosition) => void;
}> = ({ onLocationFound }) => {
  useMapEvents({
    locationfound(e) {
      const position = { lat: e.latlng.lat, lng: e.latlng.lng };
      onLocationFound(position);
    },
    locationerror(e) {
      console.error('Location error:', e.message);
      alert('Unable to find your location. Please ensure location services are enabled.');
    }
  });

  return null;
};

// Map Click Handler Component
const LocationSelector: React.FC<{
  onLocationSelect: (position: MapPosition) => void;
  selectedLocation?: MapPosition | null;
}> = ({ onLocationSelect, selectedLocation }) => {
  const [tempMarker, setTempMarker] = useState<MapPosition | null>(selectedLocation || null);

  useMapEvents({
    click(e) {
      const position = { lat: e.latlng.lat, lng: e.latlng.lng };
      setTempMarker(position);
      onLocationSelect(position);
    }
  });

  useEffect(() => {
    if (selectedLocation) {
      setTempMarker(selectedLocation);
    }
  }, [selectedLocation]);

  return tempMarker ? (
    <Marker position={[tempMarker.lat, tempMarker.lng]} icon={businessLocationIcon}>
      <Popup>
        <div className="location-selector-popup">
          <h4>📍 Selected Business Location</h4>
          <p><strong>Latitude:</strong> {tempMarker.lat.toFixed(6)}</p>
          <p><strong>Longitude:</strong> {tempMarker.lng.toFixed(6)}</p>
          <small>Click elsewhere on the map to change location</small>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

// Existing businesses marker component
const ExistingBusinessMarkers: React.FC<{ businesses: MapPosition[] }> = ({ businesses }) => {
  const existingBusinessIcon = L.divIcon({
    className: 'custom-marker existing-business-marker',
    html: `
      <div class="marker-pin" style="background-color: #6b7280; border: 2px solid #ffffff; opacity: 0.7;">
        <div class="marker-symbol" style="color: white; font-size: 12px;">🏢</div>
      </div>
    `,
    iconSize: [25, 32],
    iconAnchor: [12.5, 32],
    popupAnchor: [0, -32]
  });

  // Filter out invalid businesses and ensure lat/lng are numbers
  const validBusinesses = businesses.filter(business => {
    const lat = typeof business.lat === 'number' ? business.lat : parseFloat(business.lat as string);
    const lng = typeof business.lng === 'number' ? business.lng : parseFloat(business.lng as string);
    return !isNaN(lat) && !isNaN(lng);
  });

  return (
    <>
      {validBusinesses.map((business, index) => {
        const lat = typeof business.lat === 'number' ? business.lat : parseFloat(business.lat as string);
        const lng = typeof business.lng === 'number' ? business.lng : parseFloat(business.lng as string);

        return (
          <Marker
            key={index}
            position={[lat, lng]}
            icon={existingBusinessIcon}
          >
            <Popup>
              <div className="existing-business-popup">
                <p><strong>Existing Business Location</strong></p>
                <small>{lat.toFixed(6)}, {lng.toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Find My Location Button Component
const FindLocationButton: React.FC<{
  onFindLocation: () => void;
}> = ({ onFindLocation }) => {
  return (
    <div className="map-controls">
      <button
        onClick={onFindLocation}
        className="map-control-btn find-location-btn"
        title="Find my location"
      >
        📍
      </button>
    </div>
  );
};

// Main Location Selector Map Component
const BusinessLocationMap: React.FC<LocationSelectorProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to New York
  zoom = 10,
  height = '400px',
  selectedLocation,
  onLocationSelect,
  existingBusinesses = []
}) => {
  const [mapCenter, setMapCenter] = useState<MapPosition>(selectedLocation || center);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter(selectedLocation);
    }
  }, [selectedLocation]);

  const handleFindLocation = () => {
    if (mapRef) {
      mapRef.locate({ setView: true, maxZoom: 16 });
    }
  };

  const handleLocationFound = (position: MapPosition) => {
    onLocationSelect(position);
    setMapCenter(position);
  };

  return (
    <div className="location-selector-container">
      <div className="location-selector-instructions">
        <div className="instruction-item">
          <span className="instruction-icon">👆</span>
          <span>Click anywhere on the map to place your business location pin</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">📍</span>
          <span>Use the "Find my location" button to center the map on your current location</span>
        </div>
        {selectedLocation && (
          <div className="selected-coordinates">
            <span className="coordinate-label">Selected:</span>
            <span className="coordinate-value">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </span>
          </div>
        )}
      </div>

      <div className="map-container" style={{ height }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={selectedLocation ? Math.max(zoom, 13) : zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={setMapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Location Finder Component */}
          <LocationFinder onLocationFound={handleLocationFound} />

          {/* Location Selector Component */}
          <LocationSelector
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
          />

          {/* Show existing businesses as reference */}
          <ExistingBusinessMarkers businesses={existingBusinesses} />
        </MapContainer>

        {/* Find My Location Button */}
        <FindLocationButton onFindLocation={handleFindLocation} />
      </div>

      <div className="location-selector-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ color: '#3b82f6' }}>🏢</span>
          <span>New Business Location</span>
        </div>
        {existingBusinesses.length > 0 && (
          <div className="legend-item">
            <span className="legend-icon" style={{ color: '#6b7280' }}>🏢</span>
            <span>Existing Business ({existingBusinesses.length})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessLocationMap;