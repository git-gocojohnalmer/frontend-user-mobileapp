import type { ParkingForecast } from '../types/parking';

const mockForecastUpdatedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();

/**
 * Temporary frontend data boundary for the parking forecast panel.
 * Replace this function with the admin forecast Firebase/API source when it is available.
 */
export const getMockParkingForecast = (layoutId: string): ParkingForecast => ({
  layoutId,
  predictedOccupancy: 0.64,
  predictedAvailableSlots: 18,
  horizonMinutes: 30,
  trainingRecords: 0,
  metrics: { mae: 0, rmse: 0, r2: null },
  fetchedAt: mockForecastUpdatedAt,
});
