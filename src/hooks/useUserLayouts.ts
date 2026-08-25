import { useCallback, useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../lib/firebase';
import type { ParkingLayout, ParkingSlot } from '../types/parking';
import {
  buildMapsUrl,
  extractCoordinateFromLink,
  extractSpacesFromGrid,
  fetchOwnerLocation,
  mergeStatusesIntoGrid,
  mergeStatusSources,
  parseActiveLayouts,
  type RawLayout,
} from '../services/layoutService';

type SlotWithLayouts = ParkingSlot & { layouts: ParkingLayout[] };

interface UseAllLayoutsOptions {
  // Kept for API compatibility with existing screens. Real-time listeners do
  // not poll, so this option is intentionally ignored.
  refreshInterval?: number;
}

export const useAllLayouts = (_options: UseAllLayoutsOptions = {}) => {
  const [rawLayouts, setRawLayouts] = useState<Record<string, RawLayout> | null>(null);
  const [sensorMap, setSensorMap] = useState<Record<string, string>>({});
  const [spotMap, setSpotMap] = useState<Record<string, string>>({});
  const [ownerLocations, setOwnerLocations] = useState<
    Record<string, { name: string; link: string } | null>
  >({});
  const [layoutsReady, setLayoutsReady] = useState(false);
  const [sensorsReady, setSensorsReady] = useState(false);
  const [spotsReady, setSpotsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listener: layouts (structure changes)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'layouts'),
      (snapshot) => {
        setRawLayouts(
          snapshot.exists() ? (snapshot.val() as Record<string, RawLayout>) : {}
        );
        setLayoutsReady(true);
        setError(null);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Listener: sensors (primary real-time status source)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'sensors'),
      (snapshot) => {
        const result: Record<string, string> = {};
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<
            string,
            { spotId?: string; slotId?: string; status?: string } | null
          >;
          for (const [sensorId, sensor] of Object.entries(data)) {
            const spotId = sensor?.spotId ?? sensor?.slotId ?? sensorId;
            if (sensor?.status) {
              result[spotId] = sensor.status;
            }
          }
        }
        setSensorMap(result);
        setSensorsReady(true);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Listener: spots (fallback for spots without sensors)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'spots'),
      (snapshot) => {
        const result: Record<string, string> = {};
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, { status?: string } | null>;
          for (const [id, spot] of Object.entries(data)) {
            if (spot?.status) result[id] = spot.status;
          }
        }
        setSpotMap(result);
        setSpotsReady(true);
      },
      (err) => setError(err.message)
    );
    return () => unsub();
  }, []);

  // Resolve by occupancy severity, so occupied always wins over reserved/free.
  const statusMap = useMemo(
    () => mergeStatusSources(spotMap, sensorMap),
    [spotMap, sensorMap]
  );

  const activeLayouts = useMemo(() => parseActiveLayouts(rawLayouts), [rawLayouts]);

  // Stable key over the unique ownerIds present in active layouts
  const ownerIdsKey = useMemo(
    () =>
      Array.from(
        new Set(
          activeLayouts
            .map((l) => l.ownerId)
            .filter((id): id is string => Boolean(id))
        )
      )
        .sort()
        .join(','),
    [activeLayouts]
  );

  // Fetch owner location once per unique ownerId
  useEffect(() => {
    if (!ownerIdsKey) return;
    const ownerIds = ownerIdsKey.split(',').filter(Boolean);
    const missing = ownerIds.filter((id) => !(id in ownerLocations));
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const loc = await fetchOwnerLocation(id);
            return [id, loc] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      if (cancelled) return;
      setOwnerLocations((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerIdsKey, ownerLocations]);

  // Build one slot per active layout
  const slots = useMemo<SlotWithLayouts[]>(() => {
    return activeLayouts.map((layout) => {
      const mergedGrid = mergeStatusesIntoGrid(layout.grid, statusMap);
      const spaces = extractSpacesFromGrid(mergedGrid, statusMap);
      const available = spaces.filter((s) => s.status === 'Available').length;
      const reserved = spaces.filter((s) => s.status === 'Reserved').length;

      const ownerLoc = layout.ownerId ? ownerLocations[layout.ownerId] : null;
      const locationName = ownerLoc?.name || layout.layoutName;
      const coordinate = extractCoordinateFromLink(ownerLoc?.link);

      const enrichedLayout: ParkingLayout = { ...layout, grid: mergedGrid };

      return {
        id: layout.layoutId,
        locationName,
        status: available > 0 ? 'Available' : reserved > 0 ? 'Reserved' : 'Occupied',
        distance: '-- km',
        rate: 'Free',
        coordinate,
        mapLink: buildMapsUrl(coordinate, locationName),
        availableSlotCount: available,
        totalSlotCount: spaces.length,
        slots: spaces,
        layouts: [enrichedLayout],
      };
    });
  }, [activeLayouts, statusMap, ownerLocations]);

  const isLoading = !layoutsReady || !sensorsReady || !spotsReady;

  // No-op for FlatList.onRefresh compatibility — listeners stream updates.
  const refresh = useCallback(() => Promise.resolve(), []);

  return { slots, isLoading, error, refresh };
};
