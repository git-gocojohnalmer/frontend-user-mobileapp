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

export type ParkingSlot = {
  id: string;
  locationName: string;
  status: ParkingSlotStatus;
  distance: string;
  rate: string;
  coordinate: ParkingCoordinate;
  availableSlotCount: number;
  totalSlotCount: number;
  slots: ParkingSpace[];
};
