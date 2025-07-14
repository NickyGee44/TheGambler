import { useState, useEffect } from 'react';

interface OfflineData {
  scores: any[];
  sideBets: any[];
  lastSync: number;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    scores: [],
    sideBets: [],
    lastSync: Date.now(),
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    const savedData = localStorage.getItem('gamblerCup2025_offlineData');
    if (savedData) {
      setOfflineData(JSON.parse(savedData));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (data: Partial<OfflineData>) => {
    const updatedData = { ...offlineData, ...data, lastSync: Date.now() };
    setOfflineData(updatedData);
    localStorage.setItem('gamblerCup2025_offlineData', JSON.stringify(updatedData));
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;

    try {
      // Sync scores
      for (const score of offlineData.scores) {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(score),
        });
      }

      // Sync side bets
      for (const bet of offlineData.sideBets) {
        await fetch('/api/sidebets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bet),
        });
      }

      // Clear offline data after successful sync
      setOfflineData({
        scores: [],
        sideBets: [],
        lastSync: Date.now(),
      });
      localStorage.removeItem('gamblerCup2025_offlineData');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    syncOfflineData,
  };
};
