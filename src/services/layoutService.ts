import { get, ref } from 'firebase/database';
import { db } from '../lib/firebase';
import type {
  GridCell,
  ParkingCoordinate,
  ParkingLayout,
  ParkingSpace,
} from '../types/parking';

// ── Raw Firebase shapes ───────────────────────────────────────────────────────

export type RawSpotData = {
  slotId: string;
  slotName?: string;
  label?: string;
  status: string;
  vehicleType?: string;
  [key: string]: unknown;
};

export type RawGridCell = {
  type: 'empty' | 'road' | 'slot';
  spotId?: string;
  spotData?: RawSpotData | null;
};

export type RawLayout = {
  layoutId?: string;
  layoutName: string;
  floor: string;
  totalRows: number;
  totalColumns: number;
  grid: RawGridCell[][];
  ownerId?: string;
  lotId?: string;
  isActive?: boolean;
};

// ── Status normalization ──────────────────────────────────────────────────────

export const normalizeToGridStatus = (raw: string | undefined): string => {
  if (!raw) return 'available';
  const lower = raw.toLowerCase();
  if (lower === 'free' || lower === 'available') return 'available';
  return 'occupied';
};

export const normalizeToSpaceStatus = (
  raw: string | undefined
): 'Available' | 'Occupied' => {
  if (!raw) return 'Available';
  const lower = raw.toLowerCase();
  if (lower === 'free' || lower === 'available') return 'Available';
  return 'Occupied';
};

// ── Coordinate extraction ─────────────────────────────────────────────────────

const EMPTY_COORDINATE: ParkingCoordinate = { latitude: 0, longitude: 0 };

const toCoordinate = (lat: number, lng: number): ParkingCoordinate =>
  Number.isFinite(lat) && Number.isFinite(lng)
    ? { latitude: lat, longitude: lng }
    : EMPTY_COORDINATE;

export const extractCoordinateFromLink = (link?: string): ParkingCoordinate => {
  if (!link) return EMPTY_COORDINATE;
  const url = link.trim();

  const queryMatch = url.match(/[?&](?:q|query)=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (queryMatch) return toCoordinate(Number(queryMatch[1]), Number(queryMatch[2]));

  const centerMatch = url.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (centerMatch) return toCoordinate(Number(centerMatch[1]), Number(centerMatch[2]));

  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return toCoordinate(Number(atMatch[1]), Number(atMatch[2]));

  // Google Maps embed !2d<lng>!3d<lat>
  const embedMatch = url.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
  if (embedMatch) return toCoordinate(Number(embedMatch[2]), Number(embedMatch[1]));

  return EMPTY_COORDINATE;
};

export const buildMapsUrl = (
  coordinate: ParkingCoordinate,
  locationName: string
): string | undefined => {
  if (coordinate.latitude !== 0 || coordinate.longitude !== 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  }
  if (locationName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
  }
  return undefined;
};

// ── Pure transforms (driven by onValue snapshots) ─────────────────────────────

export const parseActiveLayouts = (
  raw: Record<string, RawLayout> | null | undefined
): ParkingLayout[] => {
  if (!raw) return [];
  return Object.entries(raw)
    .filter(
      ([, layout]) =>
        layout &&
        layout.isActive === true &&
        Array.isArray(layout.grid) &&
        layout.grid.length > 0
    )
    .map(([layoutId, layout]) => ({
      layoutId,
      layoutName: layout.layoutName,
      floor: layout.floor,
      totalRows: layout.totalRows,
      totalColumns: layout.totalColumns,
      grid: layout.grid as unknown as GridCell[][],
      ownerId: layout.ownerId,
    }));
};

export const mergeStatusesIntoGrid = (
  grid: GridCell[][],
  statusMap: Record<string, string>
): GridCell[][] =>
  grid.map((row) =>
    row.map((cell) => {
      if (cell.type !== 'slot' || !cell.spotId || !cell.spotData) return cell;
      const sd = cell.spotData as unknown as RawSpotData;
      const raw = statusMap[cell.spotId] ?? sd.status;
      return {
        ...cell,
        spotData: {
          slotId: sd.slotId ?? cell.spotId,
          slotName: sd.slotName ?? sd.slotId ?? cell.spotId,
          label: sd.label || sd.slotName || sd.slotId || cell.spotId || '?',
          status: normalizeToGridStatus(raw),
          vehicleType: sd.vehicleType ?? 'any',
        },
      };
    })
  );

export const extractSpacesFromGrid = (
  grid: GridCell[][],
  statusMap: Record<string, string>
): ParkingSpace[] => {
  const spaces: ParkingSpace[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (cell.type !== 'slot' || !cell.spotId) continue;
      const sd = (cell.spotData ?? {}) as unknown as RawSpotData;
      const raw = statusMap[cell.spotId] ?? sd.status;
      spaces.push({
        id: sd.slotId ?? cell.spotId,
        label: sd.label || sd.slotName || sd.slotId || cell.spotId || '?',
        status: normalizeToSpaceStatus(raw),
      });
    }
  }
  return spaces;
};

// ── Owner location (one-time read per ownerId) ────────────────────────────────

export const fetchOwnerLocation = async (
  ownerId: string
): Promise<{ name: string; link: string } | null> => {
  const snapshot = await get(ref(db, `users/${ownerId}/location`));
  if (!snapshot.exists()) return null;
  const loc = snapshot.val() as { name?: string; link?: string };
  if (!loc?.name && !loc?.link) return null;
  return { name: loc.name ?? '', link: loc.link ?? '' };
};
