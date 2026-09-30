import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
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

export default function InsightsScreen(): JSX.Element {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState('this_month');

  const currency = profile?.currency || '$';

  const filtered = useMemo(() => filterTransactionsByPeriod(transactions, period), [transactions, period]);

  const income = useMemo(() => calculateIncome(filtered), [filtered]);
  const expenses = useMemo(() => calculateExpenses(filtered), [filtered]);
  const net = useMemo(() => calculateNet(filtered), [filtered]);
  const count = filtered.length;
  const avgDaily = useMemo(() => getAverageDailySpend(filtered, 30), [filtered]);
  const biggest = useMemo(() => getBiggestExpense(filtered), [filtered]);
  const topCat = useMemo(() => getTopCategory(filtered, 'expense'), [filtered]);
  const byCategory = useMemo(() => getTransactionsByCategory(filtered, 'expense'), [filtered]);

  const momChange = useMemo(() => {
    const thisMonth = filterTransactionsByPeriod(transactions, 'this_month');
    const lastMonth = filterTransactionsByPeriod(transactions, 'last_month');
    return getMonthOverMonthChange(calculateExpenses(thisMonth), calculateExpenses(lastMonth));
  }, [transactions]);

  const pieData = useMemo(() => {
    return byCategory.slice(0, 6).map((cat, i) => ({
      value: cat.total,
      color: ['#0E5A4A', '#2E9E6B', '#E0A030', '#D9534F', '#4A90D9', '#7B68EE'][i % 6],
      label: cat.category,
    }));
  }, [byCategory]);

  if (filtered.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Insights</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <FilterChip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>
        <EmptyState icon="insights" message="No data for this period." subMessage="Add some transactions to see insights." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Insights</Text>

        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <FilterChip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Income" value={formatCurrency(income, currency)} icon="arrow-downward" color={colors.income} bgColor={colors.incomeBg} />
          <StatCard label="Expenses" value={formatCurrency(expenses, currency)} icon="arrow-upward" color={colors.expense} bgColor={colors.expenseBg} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Net" value={formatCurrency(net, currency)} icon="account-balance" color={net >= 0 ? colors.income : colors.expense} bgColor={net >= 0 ? colors.incomeBg : colors.expenseBg} />
          <StatCard label="Transactions" value={count.toString()} icon="receipt-long" color={colors.ink} bgColor={colors.surface} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Avg daily" value={formatCurrency(avgDaily, currency)} icon="today" color={colors.ink} bgColor={colors.surface} />
          <StatCard label="vs last month" value={`${momChange >= 0 ? '+' : ''}${momChange}%`} icon={momChange >= 0 ? 'trending-up' : 'trending-down'} color={momChange >= 0 ? colors.expense : colors.income} bgColor={momChange >= 0 ? colors.expenseBg : colors.incomeBg} />
        </View>

        {biggest && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Biggest expense</Text>
            <Text style={styles.biggestTitle}>{biggest.title}</Text>
            <Text style={styles.biggestAmount}>{formatCurrency(biggest.amount, currency)}</Text>
            <Text style={styles.biggestCategory}>{biggest.category}</Text>
          </View>
        )}

        {topCat && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top category</Text>
            <Text style={styles.topCatName}>{topCat.category}</Text>
            <Text style={styles.topCatAmount}>{formatCurrency(topCat.total, currency)}</Text>
            <Text style={styles.topCatCount}>{topCat.count} transaction{topCat.count > 1 ? 's' : ''}</Text>
          </View>
        )}

        {pieData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spending breakdown</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                radius={80}
                innerRadius={40}
                donut
                showText
                textColor={colors.ink}
                textSize={12}
                centerLabelComponent={() => (
                  <View style={styles.centerLabel}>
                    <Text style={styles.centerLabelText}>{formatCurrency(expenses, currency)}</Text>
                    <Text style={styles.centerLabelSub}>Total</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.legend}>
              {pieData.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>
                    {formatCurrency(item.value, currency)} ({Math.round((item.value / expenses) * 100)}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkMuted,
    marginBottom: spacing.md,
  },
  biggestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  biggestAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.expense,
    marginTop: spacing.xs,
  },
  biggestCategory: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  topCatName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  topCatAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.brand,
    marginTop: spacing.xs,
  },
  topCatCount: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  centerLabelSub: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  legend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
});
