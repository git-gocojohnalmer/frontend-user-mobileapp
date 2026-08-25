import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParkingSlotsScreenProps } from '../../types/navigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { ParkingGrid } from '../../components/dashboard/ParkingGrid';
import { VehicleIcon } from '../../components/dashboard/VehicleIcon';
import { useParkingForecast } from '../../hooks/useParkingForecast';
import { useAllLayouts } from '../../hooks/useUserLayouts';

const getForecastUpdatedLabel = (updatedAt: string) => {
  const minutesAgo = Math.max(
    0,
    Math.floor((Date.now() - new Date(updatedAt).getTime()) / (60 * 1000))
  );

  if (minutesAgo === 0) return 'Updated just now';
  if (minutesAgo === 1) return 'Updated 1 minute ago';
  return `Updated ${minutesAgo} minutes ago`;
};

const ParkingSlotsScreen = ({ route }: ParkingSlotsScreenProps) => {
  const { slot: initialSlot } = route.params;
  // Polling every 2 seconds for real-time updates
  const { slots } = useAllLayouts({ refreshInterval: 2000 });

  // Match by layoutId (slot.id is the layoutId in the new architecture)
  const slot = slots.find((s) => s.id === initialSlot.id) ?? initialSlot;

  const availableCount = slot.availableSlotCount;
  const totalCount = slot.totalSlotCount;
  const reservedCount = slot.slots.filter((parkingSpace) => parkingSpace.status === 'Reserved').length;
  const occupiedCount = Math.max(totalCount - availableCount - reservedCount, 0);
  const availabilityRatio = totalCount > 0 ? availableCount / totalCount : 0;
  const availabilityPercent = Math.round(availabilityRatio * 100);
  const { forecast: parkingForecast, isLoading: isForecastLoading, error: forecastError } =
    useParkingForecast(slot.id);
  const forecastUpdatedLabel = parkingForecast
    ? getForecastUpdatedLabel(parkingForecast.fetchedAt)
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryIntro}>
              <View style={styles.summaryBadge}>
                <Ionicons name="analytics" size={16} color={colors.primary} />
                <Text style={styles.summaryBadgeText}>Live Status</Text>
              </View>
              <View style={styles.titleRow}>
                <Ionicons name="car-sport" size={22} color={colors.primary} />
                <Text style={styles.title}>{slot.locationName}</Text>
              </View>
              <Text style={styles.helperText}>
                Real-time parking overview to help drivers scan availability before arriving.
              </Text>
            </View>

            <View style={styles.availabilityHighlight}>
              <Text style={styles.availabilityValue}>{availableCount}</Text>
              <Text style={styles.availabilityLabel}>Open</Text>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressTitle}>Occupancy Overview</Text>
              <Text style={styles.progressValue}>{availabilityPercent}% available</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${availabilityPercent}%` }]} />
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>
              <Text style={styles.metricValue}>{availableCount}</Text>
              <Text style={styles.metricLabel}>Available</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.warning} />
              </View>
              <Text style={styles.metricValue}>{reservedCount}</Text>
              <Text style={styles.metricLabel}>Reserved</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
              </View>
              <Text style={styles.metricValue}>{occupiedCount}</Text>
              <Text style={styles.metricLabel}>Occupied</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name="grid" size={18} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>{totalCount}</Text>
              <Text style={styles.metricLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.forecastPanel}>
            {isForecastLoading ? (
              <Text style={styles.forecastStatusText}>Loading forecast...</Text>
            ) : forecastError ? (
              <Text style={styles.forecastStatusText}>Forecast unavailable: {forecastError}</Text>
            ) : parkingForecast ? (
              <>
            <View style={styles.forecastHeader}>
              <View style={styles.forecastTitleRow}>
                <View style={styles.forecastIconWrap}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.forecastTitleCopy}>
                  <Text style={styles.forecastTitle}>Parking Forecast</Text>
                  <Text style={styles.forecastTiming}>
                    Likely in {parkingForecast.horizonMinutes} minutes
                  </Text>
                </View>
              </View>
              <View style={styles.forecastEstimatePill}>
                <Text style={styles.forecastEstimateText}>Estimated</Text>
              </View>
            </View>

            <View style={styles.forecastMetricsRow}>
              <View style={styles.forecastAvailabilityGroup}>
                <Text style={styles.forecastAvailabilityValue}>
                  {parkingForecast.predictedAvailableSlots}
                </Text>
                <Text style={styles.forecastAvailabilityLabel}>spaces available</Text>
              </View>

              <View style={styles.forecastOccupancyGroup}>
                <Text style={styles.forecastOccupancyLabel}>Expected occupancy</Text>
                <Text style={styles.forecastOccupancyValue}>
                  {Math.round(parkingForecast.predictedOccupancy * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.forecastCurrentRow}>
              <Ionicons name="trending-down-outline" size={16} color={colors.success} />
              <Text style={styles.forecastCurrentText}>
                Currently: {100 - availabilityPercent}% occupied
              </Text>
            </View>

            <View style={styles.forecastMetaRow}>
              <Text style={styles.forecastBasis}>
                Based on {parkingForecast.trainingRecords} historical records
              </Text>
              <Text style={styles.forecastUpdated}>{forecastUpdatedLabel}</Text>
            </View>
              </>
            ) : null}
          </View>
        </View>

        {slot.layouts && slot.layouts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Parking Layout</Text>
                <Text style={styles.sectionSubtitle}>Visual grid view of parking spaces</Text>
              </View>
            </View>
            {slot.layouts.map((layout) => (
              <ParkingGrid
                key={layout.layoutId}
                layoutName={layout.layoutName}
                totalRows={layout.totalRows}
                totalColumns={layout.totalColumns}
                grid={layout.grid}
              />
            ))}
          </>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Parking Spaces</Text>
            <Text style={styles.sectionSubtitle}>See all individual parking spaces</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.availableDot]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.occupiedDot]} />
              <Text style={styles.legendText}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.reservedDot]} />
              <Text style={styles.legendText}>Reserved</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {slot.slots.map((parkingSpace) => {
            const isAvailable = parkingSpace.status === 'Available';
            const isReserved = parkingSpace.status === 'Reserved';

            return (
              <View key={parkingSpace.id} style={styles.slotCard}>
                <View style={[styles.slotInnerCard, isAvailable ? styles.availableCard : isReserved ? styles.reservedCard : styles.occupiedCard]}>
                  <View style={styles.slotTopRow}>
                    <View style={[styles.slotStatusIcon, isAvailable ? styles.slotStatusIconAvailable : isReserved ? styles.slotStatusIconReserved : styles.slotStatusIconOccupied]}>
                      {isReserved ? (
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.warning}
                        />
                      ) : (
                        <VehicleIcon
                          vehicleType={parkingSpace.vehicleType}
                          size={16}
                          color={isAvailable ? colors.success : colors.danger}
                        />
                      )}
                    </View>
                    <Text style={[styles.slotPill, isAvailable ? styles.availablePillText : isReserved ? styles.reservedPillText : styles.occupiedPillText]}>
                      {parkingSpace.status}
                    </Text>
                  </View>

                  <View style={styles.slotContent}>
                    <Text style={styles.slotEyebrow}>Space</Text>
                    <Text style={[styles.slotLabel, isAvailable ? styles.availableText : isReserved ? styles.reservedText : styles.occupiedText]}>
                      {parkingSpace.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryIntro: {
    flex: 1,
  },
  summaryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  summaryBadgeText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  availabilityHighlight: {
    minWidth: 92,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  availabilityValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  availabilityLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  progressPanel: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  progressValue: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    minWidth: 10,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  metricCardPrimary: {
    backgroundColor: colors.successLight,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  forecastPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  forecastHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  forecastTitleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  forecastIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  forecastTitleCopy: {
    flex: 1,
  },
  forecastTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  forecastTiming: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  forecastEstimatePill: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  forecastEstimateText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  forecastStatusText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  forecastMetricsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  forecastAvailabilityGroup: {
    flex: 1,
  },
  forecastAvailabilityValue: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '800',
  },
  forecastAvailabilityLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: 1,
  },
  forecastOccupancyGroup: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    minWidth: 128,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  forecastOccupancyLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  forecastOccupancyValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  forecastCurrentRow: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  forecastCurrentText: {
    color: colors.success,
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  forecastMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  forecastBasis: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: typography.caption,
  },
  forecastUpdated: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  availableDot: {
    backgroundColor: colors.success,
  },
  occupiedDot: {
    backgroundColor: colors.danger,
  },
  reservedDot: {
    backgroundColor: colors.warning,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  slotCard: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  slotInnerCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  slotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStatusIconAvailable: {
    backgroundColor: colors.white,
  },
  slotStatusIconOccupied: {
    backgroundColor: colors.white,
  },
  slotStatusIconReserved: {
    backgroundColor: colors.white,
  },
  slotContent: {
    marginTop: spacing.lg,
  },
  slotEyebrow: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  slotLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  slotPill: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  availableCard: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  occupiedCard: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  reservedCard: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  availableText: {
    color: colors.success,
  },
  occupiedText: {
    color: colors.danger,
  },
  reservedText: {
    color: colors.warning,
  },
  availablePillText: {
    color: colors.success,
  },
  occupiedPillText: {
    color: colors.danger,
  },
  reservedPillText: {
    color: colors.warning,
  },
});

export default ParkingSlotsScreen;
