export interface JourneyStop {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface LocationData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  journey: JourneyStop[];
  imageUrls: string[];
  pexelsImageUrls: string[];
}

export interface SketchPadRef {
  clearCanvas: () => void;
  getCanvasAsBase64: () => string | null;
}

export interface AirplaneState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  velocity: number | null; // meters/second
  on_ground: boolean;
}