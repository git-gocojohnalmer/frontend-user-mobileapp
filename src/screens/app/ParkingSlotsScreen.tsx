import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParkingSlotsScreenProps } from '../../types/navigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';

const ParkingSlotsScreen = ({ route }: ParkingSlotsScreenProps) => {
  const { slot } = route.params;

  const availableCount = slot.availableSlotCount;
  const totalCount = slot.totalSlotCount;
  const occupiedCount = Math.max(totalCount - availableCount, 0);
  const availabilityRatio = totalCount > 0 ? availableCount / totalCount : 0;

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
                Real-time parking Overview to help drivers scan availability before arriving.
              </Text>
            </View>

            <View style={styles.availabilityHighlight}>
              <Text style={styles.availabilityValue}>{availableCount}</Text>
              <Text style={styles.availabilityLabel}>Open now</Text>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressTitle}>Occupancy Overview</Text>
              <Text style={styles.progressValue}>{Math.round(availabilityRatio * 100)}% available</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${availabilityRatio * 100}%` }]} />
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
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Parking Spaces</Text>
            <Text style={styles.sectionSubtitle}>See all available parking spaces</Text>
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
          </View>
        </View>

        <View style={styles.grid}>
          {slot.slots.map((parkingSpace) => {
            const isAvailable = parkingSpace.status === 'Available';

            return (
              <View key={parkingSpace.id} style={styles.slotCard}>
                <View style={[styles.slotInnerCard, isAvailable ? styles.availableCard : styles.occupiedCard]}>
                  <View style={styles.slotTopRow}>
                    <View style={[styles.slotStatusIcon, isAvailable ? styles.slotStatusIconAvailable : styles.slotStatusIconOccupied]}>
                      <Ionicons
                        name={isAvailable ? 'car-outline' : 'lock-closed-outline'}
                        size={16}
                        color={isAvailable ? colors.success : colors.danger}
                      />
                    </View>
                    <Text style={[styles.slotPill, isAvailable ? styles.availablePillText : styles.occupiedPillText]}>
                      {parkingSpace.status}
                    </Text>
                  </View>

                  <View style={styles.slotContent}>
                    <Text style={styles.slotEyebrow}>Space</Text>
                    <Text style={[styles.slotLabel, isAvailable ? styles.availableText : styles.occupiedText]}>
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
  availableText: {
    color: colors.success,
  },
  occupiedText: {
    color: colors.danger,
  },
  availablePillText: {
    color: colors.success,
  },
  occupiedPillText: {
    color: colors.danger,
  },
});

export default ParkingSlotsScreen;