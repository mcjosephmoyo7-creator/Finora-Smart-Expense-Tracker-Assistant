import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudgetStatus } from '../hooks/useBudgetStatus';
import { colors, spacing, radius, shadows } from '../utils/theme';
import {
  formatCurrency,
  calculateBalance,
  calculateIncome,
  calculateExpenses,
  filterTransactionsByPeriod,
  getTransactionsByCategory,
} from '../utils/calculations';
import { getGreeting, getMonthName } from '../utils/dateHelpers';
import BalanceCard from '../components/BalanceCard';
import TransactionRow from '../components/TransactionRow';
import BudgetProgressBar from '../components/BudgetProgressBar';
import EmptyState from '../components/EmptyState';
import FinoraLogo from '../components/FinoraLogo';
import SafeAreaScreen from '../components/SafeAreaScreen';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const budgetStatus = useBudgetStatus();

  const currency = profile?.currency || '$';
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'there';

  const balance = useMemo(() => calculateBalance(transactions), [transactions]);
  const thisMonthTx = useMemo(
    () => filterTransactionsByPeriod(transactions, 'this_month'),
    [transactions]
  );
  const income = useMemo(() => calculateIncome(thisMonthTx), [thisMonthTx]);
  const expenses = useMemo(() => calculateExpenses(thisMonthTx), [thisMonthTx]);

  const topCategories = useMemo(
    () => getTransactionsByCategory(thisMonthTx, 'expense').slice(0, 3),
    [thisMonthTx]
  );
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <SafeAreaScreen edges={['top', 'right', 'left']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <FinoraLogo size={36} />
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {firstName}
              </Text>
              <Text style={styles.month}>
                {getMonthName(new Date())} {new Date().getFullYear()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.avatar}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>
              {(profile?.name || 'F')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          income={income}
          expenses={expenses}
          currency={currency}
        />

        {/* Budget Strip */}
        <TouchableOpacity
          style={styles.budgetStrip}
          onPress={() => navigation.navigate('Budgets')}
          activeOpacity={0.8}
        >
          <View style={styles.budgetRow}>
            <View style={styles.budgetTitleBox}>
              <MaterialIcons
                name="account-balance-wallet"
                size={18}
                color={budgetStatus.monthlyBudget > 0 ? colors.brand : colors.inkMuted}
              />
              <Text style={styles.budgetLabel}>
                {budgetStatus.monthlyBudget > 0 ? 'Monthly Budget' : 'Set a monthly budget'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.inkMuted} />
          </View>

          {budgetStatus.monthlyBudget > 0 ? (
            <>
              <BudgetProgressBar percent={budgetStatus.percent} status={budgetStatus.status} />
              <View style={styles.budgetDetails}>
                <Text style={styles.budgetAmount}>
                  {formatCurrency(budgetStatus.spent, currency)} spent of{' '}
                  {formatCurrency(budgetStatus.monthlyBudget, currency)}
                </Text>
                <Text
                  style={[
                    styles.budgetRemaining,
                    budgetStatus.remaining < 0 && { color: colors.expense },
                  ]}
                >
                  {budgetStatus.remaining < 0
                    ? `${formatCurrency(Math.abs(budgetStatus.remaining), currency)} over`
                    : `${formatCurrency(budgetStatus.remaining, currency)} left`}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.budgetHint}>
              Tap to set your monthly spending limit & stay on track
            </Text>
          )}
        </TouchableOpacity>

        {/* Top Spending Categories */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Spending Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
                <Text style={styles.seeAll}>Insights</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.topCardsRow}>
              {topCategories.map((cat, i) => (
                <View key={cat.category} style={styles.topCatCard}>
                  <View style={styles.catRankBadge}>
                    <Text style={styles.catRankText}>#{i + 1}</Text>
                  </View>
                  <Text style={styles.topCatName} numberOfLines={1}>
                    {cat.category}
                  </Text>
                  <Text style={styles.topCatAmount}>
                    {formatCurrency(cat.total, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              message="No transactions yet"
              subMessage="Tap the + button to log your first income or expense."
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

      {/* Floating Action Button for Add Transaction */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  month: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
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
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  budgetAmount: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  budgetRemaining: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.income,
  },
  budgetHint: {
    fontSize: 13,
    color: colors.inkFaint,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
  },
  topCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topCatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.card,
  },
  catRankBadge: {
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  catRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand,
  },
  topCatName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.inkMuted,
    marginBottom: 2,
  },
  topCatAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl + 10,
    right: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
});
