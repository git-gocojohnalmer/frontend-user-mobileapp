export type UserProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  name?: string;
  fullName?: string;
  location?: { name: string; link: string };
};

export type RegisterProfile = UserProfile & {
  password: string;
};

export type UpdateProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
};

export type ParkingCoordinate = {
  latitude: number;
  longitude: number;
};

export type ParkingSlotStatus = 'Available' | 'Occupied' | 'Reserved';

export type ParkingSpace = {
  id: string;
  label: string;
  status: ParkingSlotStatus;
  vehicleType?: string;
};

export type SpotData = {
  slotId: string;
  slotName: string;
  label: string;
  status: 'available' | 'occupied' | 'reserved' | 'disabled' | string;
  vehicleType: string;
};

export type GridCell = {
  type: 'empty' | 'road' | 'slot';
  spotId?: string;
  spotData?: SpotData | null;
};

export type ParkingLayout = {
  layoutId: string;
  layoutName: string;
  floor: string;
  totalRows: number;
  totalColumns: number;
  grid: GridCell[][]; 
  ownerId?: string;
};

export type ParkingSlot = {
  id: string;
  locationName: string;
  status: ParkingSlotStatus;
  distance: string;
  rate: string;
  coordinate: ParkingCoordinate;
  mapLink?: string;
  embedUrl?: string;
  availableSlotCount: number;
  totalSlotCount: number;
  slots: ParkingSpace[];
  layouts?: ParkingLayout[];
};

export type ParkingForecast = {
  layoutId: string;
  predictedOccupancy: number;
  predictedAvailableSlots: number;
  horizonMinutes: number;
  trainingRecords: number;
  metrics: {
    mae: number;
    rmse: number;
    r2: number | null;
  };
  fetchedAt: string;
};
