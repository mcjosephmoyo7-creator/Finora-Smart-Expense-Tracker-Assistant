import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/calculations';
import { formatDateShort } from '../utils/dateHelpers';
import { Transaction } from '../types';

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
  currency: string;
}

export default function TransactionRow({ transaction, onPress, currency }: TransactionRowProps) {
  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg },
        ]}
      >
        <MaterialIcons
          name={category.icon}
          size={20}
          color={isIncome ? colors.income : colors.expense}
        />
      </View>
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.subtitle}>
          {category.label} · {formatDateShort(transaction.date)}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isIncome ? colors.income : colors.expense },
        ]}
      >
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  middle: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
