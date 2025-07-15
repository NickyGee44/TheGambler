import { useState, useEffect } from 'react';

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface GPSHook {
  location: GPSLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useGPS = (): GPSHook => {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Enhanced GPS request with better error handling and fallback
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(`GPS Success: Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = 'GPS access denied or unavailable';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS access denied. Please allow location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS location information is unavailable. Try again in a few moments.';
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS request timed out. Check your connection and try again.';
            break;
        }
        
        // Show user-friendly alert for immediate feedback
        if (error.code === error.PERMISSION_DENIED) {
          alert("GPS access denied or unavailable. Please allow location permissions in your browser settings.\n\nTip: Click 'Open in new tab' (top-right arrow) to test GPS properly outside Replit preview.");
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached positions
      }
    );
  };

  // Watch position for continuous updates
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('GPS watch position error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation
  };
};