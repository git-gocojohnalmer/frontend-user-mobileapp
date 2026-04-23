import { useCallback, useEffect, useState } from 'react';
import type { ParkingSlot } from '../types/parking';
import { fetchParkingSlots } from '../services/parkingService';

export const useParkingLots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const parkingSlots = await fetchParkingSlots();
      setSlots(parkingSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parking lots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    slots,
    isLoading,
    error,
    refresh,
  };
};