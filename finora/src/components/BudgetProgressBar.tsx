import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../utils/theme';

interface BudgetProgressBarProps {
  percent: number;
  status: 'none' | 'on-track' | 'warning' | 'over';
}

export default function BudgetProgressBar({ percent, status }: BudgetProgressBarProps) {
  const getColor = () => {
    if (status === 'over') return colors.expense;
    if (status === 'warning') return colors.amber;
    return colors.income;
  };

  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${clampedPercent}%`, backgroundColor: getColor() },
          ]}
        />
      </View>
      <Text style={[styles.percent, { color: getColor() }]}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.chip,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.chip,
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
});
