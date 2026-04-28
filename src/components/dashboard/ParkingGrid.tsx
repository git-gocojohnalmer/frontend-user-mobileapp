import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GridCell } from '../../types/parking';
import { colors, spacing, typography } from '../../theme';

interface ParkingGridProps {
  grid: GridCell[][];
  layoutName: string;
  totalRows: number;
  totalColumns: number;
}

export const ParkingGrid: React.FC<ParkingGridProps> = ({
  grid,
  layoutName,
  totalRows,
  totalColumns,
}) => {
  if (!grid || grid.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No grid layout available</Text>
      </View>
    );
  }

  const cellSize = 60;
  const gridWidth = totalColumns * cellSize + (totalColumns + 1) * spacing.sm;

  const renderCell = (cell: GridCell | undefined, rowIndex: number, colIndex: number) => {
    if (!cell) {
      return (
        <View
          key={`${rowIndex}-${colIndex}`}
          style={[styles.cell, styles.emptyCell, { width: cellSize, height: cellSize }]}
        />
      );
    }

    if (cell.type === 'empty') {
      return (
        <View
          key={`${rowIndex}-${colIndex}`}
          style={[styles.cell, styles.emptyCell, { width: cellSize, height: cellSize }]}
        />
      );
    }

    if (cell.type === 'road') {
      return (
        <View
          key={`${rowIndex}-${colIndex}`}
          style={[styles.cell, styles.roadCell, { width: cellSize, height: cellSize }]}
        />
      );
    }

    // Slot cell
    const isAvailable = cell.spotData?.status === 'available';
    const spotLabel = cell.spotData?.label || cell.spotId || '?';

    return (
      <View
        key={`${rowIndex}-${colIndex}`}
        style={[
          styles.cell,
          styles.slotCell,
          isAvailable ? styles.slotAvailable : styles.slotOccupied,
          { width: cellSize, height: cellSize },
        ]}
      >
        <Ionicons
          name={isAvailable ? 'car-outline' : 'lock-closed-outline'}
          size={20}
          color={isAvailable ? colors.success : colors.danger}
        />
        <Text style={[styles.slotLabel, isAvailable ? styles.slotLabelAvailable : styles.slotLabelOccupied]}>
          {spotLabel}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{layoutName}</Text>
        <Text style={styles.subtitle}>
          {totalRows} rows × {totalColumns} cols
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={[styles.gridContainer, { minWidth: gridWidth }]}
      >
        <View>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
          <Text style={styles.legendText}>Road/Empty</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: spacing.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  roadCell: {
    backgroundColor: '#D1D5DB',
  },
  slotCell: {
    borderWidth: 2,
  },
  slotAvailable: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.success,
  },
  slotOccupied: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
  },
  slotLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  slotLabelAvailable: {
    color: '#166534',
  },
  slotLabelOccupied: {
    color: '#7F1D1D',
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
