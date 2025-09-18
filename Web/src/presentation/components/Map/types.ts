export interface MapPosition {
  lat: number;
  lng: number;
}

export interface TradingDataPoint {
  id: string;
  position: MapPosition;
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: Date;
  type: 'buy' | 'sell' | 'neutral';
}

export interface UserLocation {
  id: string;
  position: MapPosition;
  name: string;
  type: 'home' | 'office' | 'favorite';
  description?: string;
}

export interface StaticLocation {
  id: string;
  position: MapPosition;
  name: string;
  type: 'exchange' | 'bank' | 'financial_institution';
  description?: string;
  website?: string;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export interface MapOverlay {
  id: string;
  type: 'heatmap' | 'trading_zone' | 'risk_area';
  data: MapPosition[];
  color: string;
  opacity: number;
}

export interface MapProps {
  center?: MapPosition;
  zoom?: number;
  height?: string;
  tradingData?: TradingDataPoint[];
  userLocations?: UserLocation[];
  staticLocations?: StaticLocation[];
  overlays?: MapOverlay[];
  onLocationFound?: (position: MapPosition) => void;
  onMarkerClick?: (data: TradingDataPoint | UserLocation | StaticLocation) => void;
}