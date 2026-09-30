import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import {
  formatCurrency,
  calculateIncome,
  calculateExpenses,
  calculateNet,
  getAverageDailySpend,
  getBiggestExpense,
  getTopCategory,
  getTransactionsByCategory,
  filterTransactionsByPeriod,
  getMonthOverMonthChange,
} from '../utils/calculations';
import StatCard from '../components/StatCard';
import FilterChip from '../components/FilterChip';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

const PERIODS = [
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'all_time', label: 'All time' },
];

const PALETTE = ['#0E5A4A', '#2E9E6B', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#14B8A6'];

export default function InsightsScreen() {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState('this_month');

  const currency = profile?.currency || '$';

  const filtered = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period]
  );

  const income = useMemo(() => calculateIncome(filtered), [filtered]);
  const expenses = useMemo(() => calculateExpenses(filtered), [filtered]);
  const net = useMemo(() => calculateNet(filtered), [filtered]);
  const count = filtered.length;

  const now = new Date();
  const daysInPeriod = period === 'this_month' ? Math.max(1, now.getDate()) : 30;
  const avgDaily = useMemo(
    () => getAverageDailySpend(filtered, daysInPeriod),
    [filtered, daysInPeriod]
  );
  const biggest = useMemo(() => getBiggestExpense(filtered), [filtered]);
  const topCat = useMemo(() => getTopCategory(filtered, 'expense'), [filtered]);
  const byCategory = useMemo(() => getTransactionsByCategory(filtered, 'expense'), [filtered]);

  const momChange = useMemo(() => {
    const thisMonth = filterTransactionsByPeriod(transactions, 'this_month');
    const lastMonth = filterTransactionsByPeriod(transactions, 'last_month');
    return getMonthOverMonthChange(calculateExpenses(thisMonth), calculateExpenses(lastMonth));
  }, [transactions]);

  const pieData = useMemo(() => {
    if (expenses <= 0) return [];
    return byCategory.slice(0, 6).map((cat, i) => ({
      value: cat.total,
      color: PALETTE[i % PALETTE.length],
      label: cat.category,
      text: `${Math.round((cat.total / expenses) * 100)}%`,
    }));
  }, [byCategory, expenses]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Financial Insights</Text>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <FilterChip
              key={p.key}
              label={p.label}
              selected={period === p.key}
              onPress={() => setPeriod(p.key)}
            />
          ))}
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="insights"
            message="No transactions for this period"
            subMessage="Try choosing another time range or add transactions."
          />
        ) : (
          <>
            {/* Primary Stat Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Income"
                value={formatCurrency(income, currency)}
                icon="arrow-upward"
                color={colors.income}
                bgColor={colors.incomeBg}
              />
              <StatCard
                label="Expenses"
                value={formatCurrency(expenses, currency)}
                icon="arrow-downward"
                color={colors.expense}
                bgColor={colors.expenseBg}
              />
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                label="Net Savings"
                value={formatCurrency(net, currency)}
                icon="savings"
                color={net >= 0 ? colors.income : colors.expense}
                bgColor={net >= 0 ? colors.incomeBg : colors.expenseBg}
              />
              <StatCard
                label="Transactions"
                value={count.toString()}
                icon="receipt-long"
                color={colors.ink}
                bgColor={colors.surface}
              />
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                label="Avg Daily Spend"
                value={formatCurrency(avgDaily, currency)}
                icon="today"
                color={colors.brand}
                bgColor={colors.surface}
              />
              <StatCard
                label="Month vs Last"
                value={`${momChange >= 0 ? '+' : ''}${momChange}%`}
                icon={momChange >= 0 ? 'trending-up' : 'trending-down'}
                color={momChange > 0 ? colors.expense : colors.income}
                bgColor={momChange > 0 ? colors.expenseBg : colors.incomeBg}
              />
            </View>

            {/* Highlights: Biggest Expense & Highest Category */}
            <View style={styles.highlightsRow}>
              {biggest && (
                <View style={styles.highlightCard}>
                  <View style={styles.highlightHeader}>
                    <MaterialIcons name="local-fire-department" size={20} color={colors.expense} />
                    <Text style={styles.highlightTag}>Biggest Expense</Text>
                  </View>
                  <Text style={styles.highlightTitle} numberOfLines={1}>
                    {biggest.title}
                  </Text>
                  <Text style={styles.highlightAmount}>
                    {formatCurrency(biggest.amount, currency)}
                  </Text>
                  <Text style={styles.highlightSub}>{biggest.category}</Text>
                </View>
              )}

              {topCat && (
                <View style={styles.highlightCard}>
                  <View style={styles.highlightHeader}>
                    <MaterialIcons name="pie-chart" size={20} color={colors.brand} />
                    <Text style={styles.highlightTag}>Top Category</Text>
                  </View>
                  <Text style={styles.highlightTitle} numberOfLines={1}>
                    {topCat.category}
                  </Text>
                  <Text style={styles.highlightAmount}>
                    {formatCurrency(topCat.total, currency)}
                  </Text>
                  <Text style={styles.highlightSub}>
                    {topCat.count} transaction{topCat.count > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Spending Chart Breakdown */}
            {pieData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={86}
                    innerRadius={52}
                    innerCircleColor={colors.surface}
                    centerLabelComponent={() => (
                      <View style={styles.centerLabel}>
                        <Text style={styles.centerLabelAmount} numberOfLines={1}>
                          {formatCurrency(expenses, currency)}
                        </Text>
                        <Text style={styles.centerLabelSub}>Spent</Text>
                      </View>
                    )}
                  />
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                  {pieData.map((item) => {
                    const pct = expenses > 0 ? Math.round((item.value / expenses) * 100) : 0;
                    return (
                      <View key={item.label} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.legendValue}>
                          {formatCurrency(item.value, currency)} ({pct}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  highlightTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  highlightAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  highlightSub: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centerLabelAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  centerLabelSub: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  legend: {
    marginTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
});
