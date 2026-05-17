import { useState, useEffect } from 'react';
import haversine from 'haversine-distance';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useGeolocation(target?: { lat: number; lng: number }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLoc = { lat: latitude, lng: longitude, accuracy };
        setLocation(newLoc);
        setError(null);

        if (target) {
          const dist = haversine(newLoc, target);
          setDistance(dist);
        }
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [target]);

  return { location, error, distance };
}
