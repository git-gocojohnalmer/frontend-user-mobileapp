export type UserProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  name?: string;
  fullName?: string;
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

export type ParkingSlotStatus = 'Available' | 'Occupied';

export type ParkingSpace = {
  id: string;
  label: string;
  status: ParkingSlotStatus;
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
};

export type ParkingSlot = {
  id: string;
  locationName: string;
  status: ParkingSlotStatus;
  distance: string;
  rate: string;
  coordinate: ParkingCoordinate;
  mapLink?: string;
  availableSlotCount: number;
  totalSlotCount: number;
  slots: ParkingSpace[];
  layouts?: ParkingLayout[];
};
