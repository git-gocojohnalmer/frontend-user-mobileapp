import type { ParkingForecast } from '../types/parking';

const mockForecastUpdatedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();

/**
 * Temporary frontend data boundary for the parking forecast panel.
 * Replace this function with the admin forecast Firebase/API source when it is available.
 */
export const getMockParkingForecast = (layoutId: string): ParkingForecast => ({
  layoutId,
  forecastMinutes: 30,
  availableSlotCount: 18,
  expectedOccupancyPercent: 64,
  currentOccupancyPercent: 72,
  basis: 'Based on recent parking activity',
  updatedAt: mockForecastUpdatedAt,
});
