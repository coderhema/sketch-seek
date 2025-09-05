import React, { useState, useEffect } from 'react';
import type { AirplaneState } from '../types';
import { AirplaneIcon } from './icons';

interface AirplaneFinderProps {
  latitude: number;
  longitude: number;
}

const AirplaneFinder: React.FC<AirplaneFinderProps> = ({ latitude, longitude }) => {
  const [airplanes, setAirplanes] = useState<AirplaneState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirplanes = async () => {
      setIsLoading(true);
      setError(null);
      // Create a bounding box approx. 1 degree around the location
      const latMin = latitude - 0.5;
      const latMax = latitude + 0.5;
      const lonMin = longitude - 0.5;
      const lonMax = longitude + 0.5;

      try {
        const response = await fetch(`https://opensky-network.org/api/states/all?lamin=${latMin}&lomin=${lonMin}&lamax=${latMax}&lomax=${lonMax}`);
        if (!response.ok) {
          throw new Error('Failed to fetch airplane data.');
        }
        const data = await response.json();
        const airplaneData: AirplaneState[] = (data.states || [])
          .map((s: any[]) => ({
            icao24: s[0],
            callsign: s[1]?.trim() || 'N/A',
            origin_country: s[2],
            longitude: s[5],
            latitude: s[6],
            on_ground: s[8],
            velocity: s[9], // in m/s
          }))
          .filter((p: AirplaneState) => !p.on_ground && p.velocity && p.velocity > 30) // Filter out planes on ground or very slow
          .slice(0, 5); // Limit to 5 results

        setAirplanes(airplaneData);
      } catch (e) {
        console.error(e);
        setError('Could not retrieve nearby airplane information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirplanes();
  }, [latitude, longitude]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-neutral-500">Searching for nearby airplanes...</p>;
    }
    if (error) {
      return <p className="text-red-600">{error}</p>;
    }
    if (airplanes.length === 0) {
      return <p className="text-neutral-500">No airplanes found flying nearby right now.</p>;
    }
    return (
      <ul className="space-y-3">
        {airplanes.map((plane) => (
          <li key={plane.icao24} className="flex items-center text-sm">
            <AirplaneIcon />
            <div>
              <p className="font-bold text-neutral-800">{plane.callsign}</p>
              <p className="text-neutral-600">
                From {plane.origin_country}
                {plane.velocity && ` - Traveling at ${Math.round(plane.velocity * 2.237)} mph`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default AirplaneFinder;