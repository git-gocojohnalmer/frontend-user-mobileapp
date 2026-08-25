import type {
  ParkingCoordinate,
  ParkingForecast,
  ParkingSlot,
  ParkingSpace,
  ParkingSlotStatus,
} from '../types/parking';
import { apiFetch } from './api.config';

// ── Types from the backend ───────────────────────────────────────────────────

type ParkingLotApi = {
  lotId: string;
  locationName: string;
  googleMapsLink?: string;
  totalSpace: number;
};

type SpotData = {
  slotId: string;
  slotName: string;
  label: string;
  status: 'available' | 'occupied' | 'reserved' | 'disabled' | string;
  vehicleType: string;
};

type GridCell = {
  type: 'empty' | 'road' | 'slot';
  spotId?: string;
  spotData?: SpotData | null;
};

type LayoutApi = {
  layoutId: string;
  layoutName: string;
  floor: string;
  totalRows: number;
  totalColumns: number;
  grid: GridCell[][];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_COORDINATE: ParkingCoordinate = { latitude: 0, longitude: 0 };

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const getNormalizedMapLink = (googleMapsLink?: string): string | undefined => {
  if (!googleMapsLink) return undefined;

  const decodedValue = decodeHtmlEntities(googleMapsLink.trim());
  const iframeSrcMatch = decodedValue.match(/src\s*=\s*(?:"([^"]+)"|'([^']+)')/i);
  const normalizedValue = iframeSrcMatch?.[1] ?? iframeSrcMatch?.[2] ?? decodedValue;

  return normalizedValue.trim();
};

const toCoordinate = (latitude: number, longitude: number): ParkingCoordinate => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return EMPTY_COORDINATE;
  }

  return { latitude, longitude };
};

const getCoordinateFromLink = (googleMapsLink?: string): ParkingCoordinate => {
  const normalizedMapLink = getNormalizedMapLink(googleMapsLink);
  if (!normalizedMapLink) return EMPTY_COORDINATE;

  const queryMatch = normalizedMapLink.match(/[?&](?:q|query)=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (queryMatch) {
    return toCoordinate(Number(queryMatch[1]), Number(queryMatch[2]));
  }

  const centerMatch = normalizedMapLink.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (centerMatch) {
    return toCoordinate(Number(centerMatch[1]), Number(centerMatch[2]));
  }

  const atMatch = normalizedMapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return toCoordinate(Number(atMatch[1]), Number(atMatch[2]));
  }

  const embedMatch = normalizedMapLink.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
  if (embedMatch) {
    return toCoordinate(Number(embedMatch[2]), Number(embedMatch[1]));
  }

  return EMPTY_COORDINATE;
};

const getEmbedUrlFromLink = (googleMapsLink?: string): string | undefined => {
  const normalizedMapLink = getNormalizedMapLink(googleMapsLink);
  if (!normalizedMapLink) return undefined;

  // Only return URLs that are already Google Maps embed URLs — these render
  // inside an iframe/WebView with the exact pin Google itself shows.
  if (/^https?:\/\/(www\.)?google\.com\/maps\/embed\?/i.test(normalizedMapLink)) {
    return normalizedMapLink;
  }

  return undefined;
};

const getPlaceQueryFromLink = (googleMapsLink?: string): string | undefined => {
  const normalizedMapLink = getNormalizedMapLink(googleMapsLink);
  if (!normalizedMapLink) return undefined;

  const placeMatch = normalizedMapLink.match(/!2s([^!]+)/);
  if (!placeMatch) {
    return undefined;
  }

  try {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
  } catch {
    return placeMatch[1].replace(/\+/g, ' ').trim();
  }
};

const buildMapsUrl = (googleMapsLink: string | undefined, locationName: string, coordinate: ParkingCoordinate): string | undefined => {
  if (coordinate.latitude !== 0 || coordinate.longitude !== 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  }

  const placeQuery = getPlaceQueryFromLink(googleMapsLink) || locationName;
  if (!placeQuery) {
    return getNormalizedMapLink(googleMapsLink);
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery)}`;
};

const mapSpotStatus = (status: string): ParkingSlotStatus =>
  status.trim().toLowerCase() === 'available'
    ? 'Available'
    : status.trim().toLowerCase() === 'reserved'
      ? 'Reserved'
      : 'Occupied';

// Flatten all slot-type cells across all layouts into ParkingSpace[]
const extractSlotsFromLayouts = (layouts: LayoutApi[]): ParkingSpace[] => {
  const slots: ParkingSpace[] = [];
  for (const layout of layouts) {
    for (const row of layout.grid) {
      for (const cell of row) {
        if (cell.type === 'slot' && cell.spotData) {
          slots.push({
            id: cell.spotData.slotId,
            label: cell.spotData.label || cell.spotData.slotName || cell.spotData.slotId,
            status: mapSpotStatus(cell.spotData.status),
            vehicleType: cell.spotData.vehicleType || 'any',
          });
        }
      }
    }
  }
  return slots;
};

// ── API calls ─────────────────────────────────────────────────────────────────

export const fetchAllParkingLots = async (): Promise<ParkingLotApi[]> => {
  return apiFetch<ParkingLotApi[]>('/api/parking-lots', {
    method: 'GET',
    withAuth: true,
  });
};

/**
 * Fetch all layouts for a lot including enriched grid data with live spot statuses.
 * Uses the new /api/parking-lots/[lotId]/mobile-layout endpoint.
 *  * NOTE: This endpoint returns ALL layouts for the lot, regardless of who created them.
 * Regular users (drivers) can see layouts created by admins.
 */
export const fetchLayoutsForLot = async (lotId: string): Promise<LayoutApi[]> => {
    try {
    const layouts = await apiFetch<LayoutApi[]>(`/api/parking-lots/${lotId}/mobile-layout`, {
      method: 'GET',
      withAuth: true,
    });
    console.log(`[fetchLayoutsForLot] Lot ${lotId}: Retrieved ${layouts.length} layout(s)`, layouts);
    return layouts;
  } catch (error) {
    console.error(`[fetchLayoutsForLot] Error fetching layouts for lot ${lotId}:`, error);
    throw error;
  }
};

export const fetchParkingForecast = async (layoutId: string): Promise<ParkingForecast> => {
  const forecast = await apiFetch<ParkingForecast>(
    `/api/sensor-history/predict?layoutId=${encodeURIComponent(layoutId)}`,
    {
      method: 'GET',
      withAuth: true,
    }
  );

  return {
    ...forecast,
    fetchedAt: new Date().toISOString(),
  };
};

// ── Main export used by useParkingLots hook ───────────────────────────────────

export const fetchParkingSlots = async (): Promise<ParkingSlot[]> => {
  const lots = await fetchAllParkingLots();

  return Promise.all(
    lots.map(async (lot) => {
      const layouts = await fetchLayoutsForLot(lot.lotId);
      const slots = extractSlotsFromLayouts(layouts);
      const availableSlotCount = slots.filter((s) => s.status === 'Available').length;
      const reservedSlotCount = slots.filter((s) => s.status === 'Reserved').length;
      const coordinate = getCoordinateFromLink(lot.googleMapsLink);

      return {
        id: lot.lotId,
        locationName: lot.locationName,
        status:
          availableSlotCount > 0
            ? 'Available'
            : reservedSlotCount > 0
              ? 'Reserved'
              : 'Occupied',
        distance: '-- km',
        rate: 'Free',
        coordinate,
        mapLink: buildMapsUrl(lot.googleMapsLink, lot.locationName, coordinate),
        embedUrl: getEmbedUrlFromLink(lot.googleMapsLink),
        availableSlotCount,
        totalSlotCount: slots.length > 0 ? slots.length : lot.totalSpace,
        slots,
        // Attach raw layouts so ParkingSlots screen can render the grid
        layouts,
      } as ParkingSlot & { layouts: LayoutApi[] };
    }),
  );
};

export const updateSpotStatus = async (
  slotId: string,
  status: 'available' | 'occupied' | 'reserved'
): Promise<void> => {
  await apiFetch<unknown>(`/api/spots/${encodeURIComponent(slotId)}`, {
    method: 'PATCH',
    withAuth: true,
    body: { status },
  });
};

// Re-export LayoutApi type so screens can use it
export type { LayoutApi, GridCell, SpotData };
