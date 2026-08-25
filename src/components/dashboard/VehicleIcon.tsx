import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type VehicleType = 'van' | 'sedan' | 'motorcycle' | 'any' | string;

type VehicleIconProps = {
  vehicleType?: VehicleType;
  size: number;
  color: string;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const getVehicleIconName = (vehicleType?: VehicleType): IconName => {
  const normalizedType = vehicleType?.trim().toLowerCase();

  if (normalizedType === 'van' || normalizedType === 'truck' || normalizedType === 'heavy vehicle') {
    return 'bus-outline';
  }

  if (normalizedType === 'motorcycle' || normalizedType === 'motorbike') {
    return 'bicycle-outline';
  }

  return 'car-outline';
};

export const VehicleIcon = ({ vehicleType, size, color }: VehicleIconProps) => (
  <Ionicons name={getVehicleIconName(vehicleType)} size={size} color={color} />
);
