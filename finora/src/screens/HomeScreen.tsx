import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudgetStatus } from '../hooks/useBudgetStatus';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { formatCurrency, calculateBalance, calculateIncome, calculateExpenses, filterTransactionsByPeriod, getTransactionsByCategory } from '../utils/calculations';
import { getGreeting, getMonthName } from '../utils/dateHelpers';
import BalanceCard from '../components/BalanceCard';
import TransactionRow from '../components/TransactionRow';
import BudgetProgressBar from '../components/BudgetProgressBar';
import EmptyState from '../components/EmptyState';

export default function HomeScreen({ navigation }: { navigation: any }): JSX.Element {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const budgetStatus = useBudgetStatus();

  const currency = profile?.currency || '$';
  const firstName = profile?.name?.split(' ')[0] || 'there';

  const balance = useMemo(() => calculateBalance(transactions), [transactions]);
  const thisMonthTx = useMemo(() => filterTransactionsByPeriod(transactions, 'this_month'), [transactions]);
  const income = useMemo(() => calculateIncome(thisMonthTx), [thisMonthTx]);
  const expenses = useMemo(() => calculateExpenses(thisMonthTx), [thisMonthTx]);

  const topCategories = useMemo(() => getTransactionsByCategory(thisMonthTx, 'expense').slice(0, 3), [thisMonthTx]);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const budgetColor = budgetStatus.status === 'over' ? colors.expense : budgetStatus.status === 'warning' ? colors.amber : colors.income;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
            <Text style={styles.month}>{getMonthName(new Date())} {new Date().getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name || 'F')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <BalanceCard balance={balance} income={income} expenses={expenses} currency={currency} />

        <TouchableOpacity
          style={styles.budgetStrip}
          onPress={() => navigation.navigate('Budgets')}
          activeOpacity={0.8}
        >
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>
              {budgetStatus.monthlyBudget > 0 ? 'Monthly Budget' : 'Set a budget'}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.inkMuted} />
          </View>
          {budgetStatus.monthlyBudget > 0 ? (
            <>
              <BudgetProgressBar percent={budgetStatus.percent} status={budgetStatus.status} />
              <Text style={styles.budgetAmount}>
                {formatCurrency(budgetStatus.spent, currency)} of {formatCurrency(budgetStatus.monthlyBudget, currency)}
              </Text>
            </>
          ) : (
            <Text style={styles.budgetHint}>Tap to set your monthly spending limit</Text>
          )}
        </TouchableOpacity>

        {topCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top categories</Text>
            {topCategories.map((cat) => (
              <View key={cat.category} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(cat.total, currency)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              message="Nothing here yet."
              subMessage="Add your first expense to get started."
            />
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                currency={currency}
                onPress={() => navigation.navigate('TransactionDetails', { id: tx.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  month: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  budgetStrip: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.card,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  budgetAmount: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  budgetHint: {
    fontSize: 13,
    color: colors.inkFaint,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    color: colors.ink,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
});
