import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { formatCurrency } from '../utils/calculations';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  currency: string;
}

export default function BalanceCard({ balance, income, expenses, currency }: BalanceCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={[styles.iconBox, { backgroundColor: colors.incomeBg }]}>
            <MaterialIcons name="arrow-upward" size={16} color={colors.income} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: colors.income }]}>
              {formatCurrency(income, currency)}
            </Text>
          </View>
        </View>
        <View style={styles.stat}>
          <View style={[styles.iconBox, { backgroundColor: colors.expenseBg }]}>
            <MaterialIcons name="arrow-downward" size={16} color={colors.expense} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statValue, { color: colors.expense }]}>
              {formatCurrency(expenses, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.card,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
