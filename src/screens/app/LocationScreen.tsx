import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AppStackParamList } from '../../types/navigation';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Location'>;

const LocationScreen = ({ route }: Props) => {
  const { slot } = route.params;
  const [webViewLoading, setWebViewLoading] = useState(true);

  const availableCount = slot.availableSlotCount;
  const totalCount = slot.totalSlotCount;
  const occupiedCount = Math.max(totalCount - availableCount, 0);
  const embedUrl = slot.embedUrl;
  const mapsUrl = slot.mapLink;

  const handleOpenDirections = async () => {
    if (!mapsUrl) {
      return;
    }

    const canOpen = await Linking.canOpenURL(mapsUrl);

    if (canOpen) {
      await Linking.openURL(mapsUrl);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.liveBadge}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.liveBadgeText}>Navigation ready</Text>
            </View>
            <View style={[styles.statusBadge, slot.status === 'Available' ? styles.statusBadgeAvailable : styles.statusBadgeOccupied]}>
              <View style={[styles.statusDot, slot.status === 'Available' ? styles.statusDotAvailable : styles.statusDotOccupied]} />
              <Text style={[styles.statusBadgeText, slot.status === 'Available' ? styles.statusTextAvailable : styles.statusTextOccupied]}>
                {slot.status}
              </Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleIconWrap}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{slot.locationName}</Text>
              <Text style={styles.descriptionText}>
                Live parking information sourced from admin-managed lot details and slot updates.
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <Text style={styles.metricValue}>{availableCount}</Text>
              <Text style={styles.metricLabel}>Available spots</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{occupiedCount}</Text>
              <Text style={styles.metricLabel}>Occupied spots</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalCount}</Text>
              <Text style={styles.metricLabel}>Total spaces</Text>
            </View>
          </View>

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>Map directions are available for this parking location.</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="analytics-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>Availability updates should reflect admin and sensor-backed spot data.</Text>
            </View>
          </View>

          <Pressable
            onPress={handleOpenDirections}
            disabled={!mapsUrl}
            style={({ pressed }) => [
              styles.primaryButton,
              !mapsUrl && styles.primaryButtonDisabled,
              pressed && mapsUrl ? styles.primaryButtonPressed : null,
            ]}
          >
            <Ionicons name="navigate-circle" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>{mapsUrl ? 'Open in Google Maps' : 'Location unavailable'}</Text>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parking map preview</Text>
            <Text style={styles.sectionSubtitle}>Live Google Maps view of the saved location.</Text>
          </View>

          {embedUrl ? (
            <View style={styles.mapWrapper}>
              <WebView
                source={{ uri: embedUrl }}
                style={styles.map}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                allowsInlineMediaPlayback
                setSupportMultipleWindows={false}
              />
              {webViewLoading ? (
                <View style={styles.mapLoadingOverlay} pointerEvents="none">
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyMapState}>
              <Ionicons name="map-outline" size={36} color={colors.textSecondary} />
              <Text style={styles.emptyMapTitle}>Map preview unavailable</Text>
              <Text style={styles.emptyMapText}>
                This parking lot does not have a Google Maps embed link configured yet. Ask an admin to paste the iframe
                from Google Maps → Share → Embed a map.
              </Text>
            </View>
          )}
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
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  liveBadgeText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusBadgeAvailable: {
    backgroundColor: colors.successLight,
  },
  statusBadgeOccupied: {
    backgroundColor: colors.dangerLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusDotAvailable: {
    backgroundColor: colors.success,
  },
  statusDotOccupied: {
    backgroundColor: colors.danger,
  },
  statusBadgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: colors.success,
  },
  statusTextOccupied: {
    color: colors.danger,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
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
  metricValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  infoPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.muted,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    marginBottom: spacing.md,
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
  mapWrapper: {
    width: '100%',
    height: 360,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  emptyMapState: {
    height: 220,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyMapTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyMapText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});

export default LocationScreen;
