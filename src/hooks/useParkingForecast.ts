import { useEffect, useState } from 'react';
import { fetchParkingForecast } from '../services/parkingService';
import type { ParkingForecast } from '../types/parking';

type UseParkingForecastResult = {
  forecast: ParkingForecast | null;
  isLoading: boolean;
  error: string | null;
};

export const useParkingForecast = (layoutId: string): UseParkingForecastResult => {
  const [forecast, setForecast] = useState<ParkingForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setForecast(null);
    setIsLoading(true);
    setError(null);

    fetchParkingForecast(layoutId)
      .then((result) => {
        if (!cancelled) setForecast(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load parking forecast');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [layoutId]);

  return {
    forecast,
    isLoading,
    error,
  };
};
