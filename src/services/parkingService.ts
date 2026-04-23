import type { ParkingCoordinate, ParkingSlot, ParkingSpace, ParkingSlotStatus } from '../types/parking';
import { apiFetch } from './api.config';

type ParkingLotApi = {
  lotId: string;
  locationName: string;
  googleMapsLink?: string;
  totalSpace: number;
};

type ParkingLayoutApi = {
  layoutId: string;
  lotId: string;
};

type ParkingSpotApiStatus = 'available' | 'occupied' | 'reserved' | 'disabled' | string;

type ParkingSpotApi = {
  spotId: string;
  layoutId: string;
  spotNumber?: string;
  label?: string;
  status: ParkingSpotApiStatus;
};

const getCoordinateFromLink = (googleMapsLink?: string): ParkingCoordinate => {
  if (!googleMapsLink) {
    return { latitude: 0, longitude: 0 };
  }

  const queryMatch = googleMapsLink.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (queryMatch) {
    return {
      latitude: Number(queryMatch[1]),
      longitude: Number(queryMatch[2]),
    };
  }

  const atMatch = googleMapsLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return {
      latitude: Number(atMatch[1]),
      longitude: Number(atMatch[2]),
    };
  }

  return { latitude: 0, longitude: 0 };
};

const mapSpotStatus = (status: ParkingSpotApiStatus): ParkingSlotStatus => {
  return status === 'available' ? 'Available' : 'Occupied';
};

const mapSpot = (spot: ParkingSpotApi): ParkingSpace => ({
  id: spot.spotId,
  label: spot.label ?? spot.spotNumber ?? spot.spotId,
  status: mapSpotStatus(spot.status),
});

export const fetchAllParkingLots = async (): Promise<ParkingLotApi[]> => {
  return apiFetch<ParkingLotApi[]>('/api/parkinglots', {
    method: 'GET',
    withAuth: true,
  });
};

export const fetchLayoutsByLot = async (lotId: string): Promise<ParkingLayoutApi[]> => {
  return apiFetch<ParkingLayoutApi[]>(`/api/parkinglots/${lotId}/layouts`, {
    method: 'GET',
    withAuth: true,
  });
};

export const fetchSpotsByLayout = async (layoutId: string): Promise<ParkingSpotApi[]> => {
  return apiFetch<ParkingSpotApi[]>(`/api/layouts/${layoutId}/spots`, {
    method: 'GET',
    withAuth: true,
  });
};

export const fetchParkingSlots = async (): Promise<ParkingSlot[]> => {
  const lots = await fetchAllParkingLots();

  return Promise.all(
    lots.map(async (lot) => {
      const layouts = await fetchLayoutsByLot(lot.lotId);
      const spotsByLayout = await Promise.all(layouts.map((layout) => fetchSpotsByLayout(layout.layoutId)));
      const flattenedSpots = spotsByLayout.flat();
      const slots = flattenedSpots.map(mapSpot);
      const availableSlotCount = slots.filter((slot) => slot.status === 'Available').length;

      return {
        id: lot.lotId,
        locationName: lot.locationName,
        status: availableSlotCount > 0 ? 'Available' : 'Occupied',
        distance: '-- km',
        rate: 'Free',
        coordinate: getCoordinateFromLink(lot.googleMapsLink),
        availableSlotCount,
        totalSlotCount: lot.totalSpace,
        slots,
      };
    }),
  );
};