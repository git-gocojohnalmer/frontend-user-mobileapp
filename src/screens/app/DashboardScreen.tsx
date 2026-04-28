import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header';
import ParkingSlotCard from '../../components/dashboard/ParkingSlotCard';
import { useAuth } from '../../hooks/useAuth';
import { useAllLayouts } from '../../hooks/useUserLayouts';
import type { AppStackParamList } from '../../types/navigation';
import type { ParkingSlot } from '../../types/parking';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const { slots, isLoading, error, refresh } = useAllLayouts();

  const totalAvailableSpaces = slots.reduce((sum, s) => sum + s.availableSlotCount, 0);
  const totalCapacity = slots.reduce((sum, s) => sum + s.totalSlotCount, 0);
  const openLocations = slots.filter((s) => s.availableSlotCount > 0).length;
  const nearestSpot = slots[0] ?? null;
  const occupancyRate =
    totalCapacity === 0
      ? 0
      : Math.round(((totalCapacity - totalAvailableSpaces) / totalCapacity) * 100);

  const stats = [
    {
      id: 'spaces',
      label: 'Open spaces',
      value: isLoading ? '...' : totalAvailableSpaces.toString(),
      icon: 'car-sport-outline' as const,
      accentColor: '#8B5CF6',
    },
    {
      id: 'locations',
      label: 'Live locations',
      value: isLoading ? '...' : openLocations.toString(),
      icon: 'location-outline' as const,
      accentColor: '#06B6D4',
    },
    {
      id: 'capacity',
      label: 'Occupancy',
      value: isLoading ? '...' : `${occupancyRate}%`,
      icon: 'speedometer-outline' as const,
      accentColor: '#22C55E',
    },
  ];

  const quickActions = [
    {
      id: 'map',
      label: 'Open map',
      icon: 'map-outline' as const,
      onPress: () => {
        if (nearestSpot) {
          navigation.navigate('Location', { slot: nearestSpot });
        }
      },
    },
    {
      id: 'slots',
      label: 'View slots',
      icon: 'grid-outline' as const,
      onPress: () => {
        if (nearestSpot) {
          navigation.navigate('ParkingSlots', { slot: nearestSpot });
        }
      },
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'settings-outline' as const,
      onPress: () => navigation.navigate('EditAccount'),
    },
  ];

  const renderItem = ({ item }: { item: ParkingSlot }) => (
    <ParkingSlotCard
      slot={item}
      onPressLink={() => navigation.navigate('Location', { slot: item })}
      onPressViewSlots={() => navigation.navigate('ParkingSlots', { slot: item })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.emptyText}>Loading your parking area...</Text>
        </>
      ) : (
        <Text style={styles.emptyText}>No parking area configured</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Header 
              name={user?.firstName ?? 'Driver'} 
              onPressSettings={() => navigation.navigate('EditAccount')} 
            />

            <View style={styles.heroCard}>
              <View style={styles.heroGlowPrimary} />
              <View style={styles.heroGlowSecondary} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <Ionicons name="flash-outline" size={14} color={colors.white} />
                  <Text style={styles.heroBadgeText}>FleXpark live</Text>
                </View>
                <View style={styles.heroSignal}>
                  <Ionicons name="radio-outline" size={14} color="#BAE6FD" />
                  <Text style={styles.heroSignalText}>Real-time sync</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>Your parking command center</Text>
              <Text style={styles.heroSubtitle}>
                Track nearby availability, jump into the map, and move faster with a live view of every active zone.
              </Text>

              <View style={styles.heroHighlightsRow}>
                <View style={styles.heroHighlightCard}>
                  <Text style={styles.heroHighlightValue}>
                    {isLoading ? '...' : totalAvailableSpaces}
                  </Text>
                  <Text style={styles.heroHighlightLabel}>spaces open now</Text>
                </View>
                <View style={styles.heroHighlightDivider} />
                <View style={styles.heroHighlightCard}>
                  <Text style={styles.heroHighlightValue}>
                    {isLoading ? '...' : (nearestSpot?.distance ?? '--')}
                  </Text>
                  <Text style={styles.heroHighlightLabel}>closest live spot</Text>
                </View>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable 
                  onPress={refresh} 
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: `${stat.accentColor}18` }]}>
                    <Ionicons name={stat.icon} size={18} color={stat.accentColor} />
                  </View>
                  <Text style={stat.value === '...' ? styles.statValueLoading : styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Quick actions</Text>
              <View style={styles.actionsRow}>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    onPress={action.onPress}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                  >
                    <View style={styles.actionIconWrap}>
                      <Ionicons name={action.icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.listHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Nearby live parking</Text>
                <Text style={styles.sectionSubtitle}>
                  {isLoading
                    ? 'Loading monitored parking locations...'
                    : `${totalAvailableSpaces} open spaces right now`}
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {isLoading ? 'Syncing...' : 'Updated now'}
                </Text>
              </View>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.card,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(125, 211, 252, 0.25)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -35,
    left: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  heroSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSignalText: {
    color: '#DBEAFE',
    fontSize: typography.caption,
    fontWeight: '600',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.sm,
    maxWidth: '82%',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: typography.body,
    lineHeight: 21,
    marginBottom: spacing.lg,
    maxWidth: '92%',
  },
  heroHighlightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.14)',
  },
  heroHighlightCard: {
    flex: 1,
  },
  heroHighlightDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: spacing.md,
  },
  heroHighlightValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroHighlightLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: typography.caption,
    fontWeight: '600',
  },
  errorBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    ...shadows.card,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValueLoading: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionsSection: {
    marginTop: spacing.lg,
  },
  actionsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
  listHeaderRow: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
    maxWidth: 240,
  },
  sectionBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    backgroundColor: '#E0F2FE',
  },
  sectionBadgeText: {
    color: '#0369A1',
    fontSize: typography.caption,
    fontWeight: '700',
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;