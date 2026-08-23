import { useMemo } from 'react';
import { getMockParkingForecast } from '../data/mockParkingForecast';
import type { ParkingForecast } from '../types/parking';

type UseParkingForecastResult = {
  forecast: ParkingForecast | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * UI-facing forecast boundary. Replace the mock lookup with an admin forecast
 * subscription or API request without changing the consuming screens.
 */
export const useParkingForecast = (layoutId: string): UseParkingForecastResult => {
  const forecast = useMemo(() => getMockParkingForecast(layoutId), [layoutId]);

  return {
    forecast,
    isLoading: false,
    error: null,
  };
};
