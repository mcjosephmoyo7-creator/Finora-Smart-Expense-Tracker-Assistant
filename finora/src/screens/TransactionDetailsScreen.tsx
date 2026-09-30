import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/calculations';
import { formatDate } from '../utils/dateHelpers';
import AppButton from '../components/AppButton';

export default function TransactionDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { profile } = useAuth();
  const { transactions, deleteTransaction } = useTransactions();
  const { id } = route.params;

  const transaction = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This transaction was deleted.</Text>
          <AppButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';
  const currency = profile?.currency || '$';

  const handleDelete = () => {
    Alert.alert('Delete transaction', `"${transaction.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountSection}>
          <View style={[styles.badge, { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg }]}>
            <MaterialIcons name={category.icon} size={32} color={isIncome ? colors.income : colors.expense} />
          </View>
          <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
          </Text>
          <Text style={styles.title}>{transaction.title}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Category</Text>
            <View style={styles.rowValue}>
              <MaterialIcons name={category.icon} size={16} color={colors.inkMuted} />
              <Text style={styles.rowText}>{category.label}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowText}>{formatDate(transaction.date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Note</Text>
            <Text style={styles.rowText}>{transaction.note || 'No note added'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Created</Text>
            <Text style={styles.rowText}>
              {transaction.createdAt?.toDate?.() ? formatDate(transaction.createdAt.toDate()) : 'Just now'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Edit"
            variant="secondary"
            onPress={() => navigation.navigate('AddEditTransaction', { transaction })}
          />
          <AppButton title="Delete" variant="danger" onPress={handleDelete} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  content: {
    padding: spacing.xl,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    marginLeft: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  missingText: {
    fontSize: 16,
    color: colors.inkMuted,
    marginBottom: spacing.lg,
  },
});
