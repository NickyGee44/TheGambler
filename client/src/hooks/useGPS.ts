import { useState, useEffect, useRef } from 'react';

const MAX_ACCURACY_METERS = 7; // Maximum accuracy threshold in meters (about 7 yards)
const MIN_ACCURACY_READINGS = 3; // Minimum consecutive accurate readings before showing data
const POSITION_UPDATE_INTERVAL = 2000; // Update position every 2 seconds

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: number;
}

export interface GPSHook {
  position: GPSLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
  accuracyStatus: string;
  isHighAccuracy: boolean;
}

export const useGPS = (): GPSHook => {
  const [position, setPosition] = useState<GPSLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracyStatus, setAccuracyStatus] = useState<string>('Acquiring precise location...');
  
  const watchIdRef = useRef<number | null>(null);
  const accurateReadingsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Enhanced GPS request with high accuracy filtering
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const accuracy = pos.coords.accuracy;
        console.log(`GPS Reading: Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}, Accuracy: ${accuracy}m`);
        
        // Only accept high accuracy readings
        if (accuracy <= MAX_ACCURACY_METERS) {
          accurateReadingsRef.current += 1;
          
          if (accurateReadingsRef.current >= MIN_ACCURACY_READINGS) {
            setPosition({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: accuracy,
              timestamp: pos.timestamp
            });
            setIsLoading(false);
            setAccuracyStatus(`GPS accurate to ${Math.round(accuracy)}m`);
          } else {
            setAccuracyStatus(`Improving accuracy... (${accurateReadingsRef.current}/${MIN_ACCURACY_READINGS})`);
          }
        } else {
          accurateReadingsRef.current = 0;
          setAccuracyStatus(`GPS accuracy: ${Math.round(accuracy)}m (need ≤${MAX_ACCURACY_METERS}m)`);
        }
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
        setAccuracyStatus('GPS error');
        accurateReadingsRef.current = 0;
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 0 // Always get fresh position
      }
    );
  };

  // Watch position for continuous updates with accuracy filtering
  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const accuracy = pos.coords.accuracy;
          const now = Date.now();
          
          // Throttle updates to prevent too frequent changes
          if (now - lastUpdateRef.current < POSITION_UPDATE_INTERVAL) {
            return;
          }
          
          // Check if accuracy meets our threshold
          if (accuracy <= MAX_ACCURACY_METERS) {
            accurateReadingsRef.current += 1;
            
            // Only update position after we have enough accurate readings
            if (accurateReadingsRef.current >= MIN_ACCURACY_READINGS) {
              setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: accuracy,
                timestamp: pos.timestamp
              });
              setAccuracyStatus(`GPS accurate to ${Math.round(accuracy)}m`);
              lastUpdateRef.current = now;
            }
          } else {
            // Reset counter if accuracy drops
            accurateReadingsRef.current = 0;
            setAccuracyStatus(`GPS accuracy: ${Math.round(accuracy)}m (need ≤${MAX_ACCURACY_METERS}m)`);
            
            // Don't show position if accuracy is very poor
            if (accuracy > 20) {
              setPosition(null);
            }
          }
        },
        (error) => {
          console.warn('GPS watch position error:', error);
          setAccuracyStatus('GPS watch error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Always get fresh readings
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    isLoading,
    error,
    requestLocation,
    accuracyStatus,
    isHighAccuracy: position?.accuracy !== undefined && position.accuracy <= MAX_ACCURACY_METERS
  };
};