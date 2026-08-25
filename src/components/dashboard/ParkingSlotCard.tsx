import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { ParkingSlot } from '../../types/parking';

type ParkingSlotCardProps = {
  slot: ParkingSlot;
  onPressLink: () => void;
  onPressViewSlots: () => void;
};

const ParkingSlotCard = ({
  slot,
  onPressLink,
  onPressViewSlots,
}: ParkingSlotCardProps) => {
  const isAvailable = slot.status === 'Available';
  const isReserved = slot.status === 'Reserved';
  const totalSlots = Math.max(slot.totalSlotCount, 0);
  const availableSlots = Math.min(Math.max(slot.availableSlotCount, 0), totalSlots);
  const reservedSlots = slot.slots.filter((parkingSpace) => parkingSpace.status === 'Reserved').length;
  const occupiedSlots = Math.max(totalSlots - availableSlots - reservedSlots, 0);
  const availabilityRatio = totalSlots > 0 ? availableSlots / totalSlots : 0;
  const availabilityWidth = Math.max(availabilityRatio * 100, 6);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <View style={styles.locationIconWrap}>
            <Ionicons
              color={colors.primary}
              name="car-sport-outline"
              size={20}
            />
          </View>

          <View style={styles.titleTextWrap}>
            <Text style={styles.eyebrow}>FleXpark Hub</Text>
            <Text style={styles.locationName}>{slot.locationName}</Text>
            <Text style={styles.subcopy}>
              {isAvailable ? 'Spaces ready for arrival' : 'Currently operating at full demand'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            isAvailable
              ? styles.availablePill
              : isReserved
                ? styles.reservedPill
                : styles.occupiedPill,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isAvailable
                ? styles.availableDot
                : isReserved
                  ? styles.reservedDot
                  : styles.occupiedDot,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isAvailable
                ? styles.availableText
                : isReserved
                  ? styles.reservedText
                  : styles.occupiedText,
            ]}
          >
            {slot.status}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricLabelRow}>
            <Feather color={colors.textSecondary} name="map-pin" size={14} />
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <Text style={styles.metricValue}>{slot.distance}</Text>
          <Text style={styles.metricHint}>From your current route</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricLabelRow}>
            <Feather color={colors.textSecondary} name="credit-card" size={14} />
            <Text style={styles.metricLabel}>Rate</Text>
          </View>
          <Text style={styles.metricValue}>{slot.rate}</Text>
          <Text style={styles.metricHint}>Transparent parking fee</Text>
        </View>
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <View style={styles.availabilityTextWrap}>
            <Text style={styles.summaryLabel}>Live Availability</Text>
            <Text style={styles.summaryValue}>
              {availableSlots} of {totalSlots} slots open now
            </Text>
          </View>

          <View style={styles.capacityChip}>
            <Text style={styles.capacityChipText}>
              {occupiedSlots} occupied{reservedSlots > 0 ? ` · ${reservedSlots} reserved` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${availabilityWidth}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressCaption}>Available</Text>
          <Text style={styles.progressCaption}>
            {Math.round(availabilityRatio * 100)}% ready
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onPressViewSlots}
          style={({ pressed }) => [
            styles.actionButton,
            styles.viewSlotsButton,
            pressed && styles.primaryPressed,
          ]}
        >
          <Feather color={colors.white} name="grid" size={16} />
          <Text style={styles.viewSlotsText}>View Slots</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onPressLink}
          style={({ pressed }) => [
            styles.actionButton,
            styles.linkButton,
            pressed && styles.secondaryPressed,
          ]}
        >
          <Feather color={colors.primary} name="navigation" size={16} />
          <Text style={styles.linkText}>View Map</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.card,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleSection: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  locationIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 48,
  },
  titleTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  locationName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  subcopy: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  availablePill: {
    backgroundColor: colors.successLight,
  },
  occupiedPill: {
    backgroundColor: colors.dangerLight,
  },
  reservedPill: {
    backgroundColor: colors.warningLight,
  },
  statusDot: {
    borderRadius: radius.pill,
    height: 8,
    marginRight: 6,
    width: 8,
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
  statusText: {
    fontSize: typography.caption,
    fontWeight: '700',
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    padding: spacing.md,
  },
  metricLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  metricValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricHint: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  availabilityCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  availabilityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  availabilityTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  capacityChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  capacityChipText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 10,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCaption: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  viewSlotsButton: {
    backgroundColor: colors.primary,
  },
  linkButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  viewSlotsText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: spacing.xs,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: spacing.xs,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondaryPressed: {
    backgroundColor: colors.background,
  },
});

export default ParkingSlotCard;