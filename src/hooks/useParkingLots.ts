import { useCallback, useEffect, useRef, useState } from 'react';
import type { ParkingSlot } from '../types/parking';
import { fetchParkingSlots } from '../services/parkingService';

interface UseParkingLotsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useParkingLots = (options: UseParkingLotsOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 1000 } = options;
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        void refresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    slots,
    isLoading,
    error,
    refresh,
  };
};