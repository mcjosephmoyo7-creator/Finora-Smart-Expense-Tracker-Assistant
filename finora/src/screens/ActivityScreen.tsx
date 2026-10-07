import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import {
  formatCurrency,
  calculateNet,
  filterTransactionsByPeriod,
  parseTransactionDate,
} from '../utils/calculations';
import { getSectionLabel } from '../utils/dateHelpers';
import { ALL_CATEGORIES } from '../utils/categories';
import TransactionRow from '../components/TransactionRow';
import FilterChip from '../components/FilterChip';
import EmptyState from '../components/EmptyState';
import { Transaction } from '../types';
import SafeAreaScreen from '../components/SafeAreaScreen';

const PERIODS = [
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'all_time', label: 'All time' },
];

export default function ActivityScreen({ navigation }: { navigation: any }) {
  const { profile } = useAuth();
  const { transactions } = useTransactions();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [period, setPeriod] = useState('this_month');

  const currency = profile?.currency || '$';

  const filtered = useMemo(() => {
    let result = filterTransactionsByPeriod(transactions, period);
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter) {
      result = result.filter(
        (t) => t.category === categoryFilter || t.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return result;
  }, [transactions, period, typeFilter, categoryFilter, search]);

  const sections = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      const label = getSectionLabel(tx.date);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(tx);
    });
    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filtered]);

  const net = useMemo(() => calculateNet(filtered), [filtered]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter(null);
    setCategoryFilter(null);
    setPeriod('this_month');
  };

  const hasActiveFilters = search.trim() !== '' || typeFilter !== null || categoryFilter !== null || period !== 'this_month';

  return (
    <SafeAreaScreen edges={['top', 'right', 'left']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color={colors.inkFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or note..."
          placeholderTextColor={colors.inkFaint}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="cancel" size={18} color={colors.inkFaint} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row 1: Type & Period */}
      <View style={styles.filtersWrapper}>
        <View style={styles.filterRow}>
          <FilterChip label="All Types" selected={typeFilter === null} onPress={() => setTypeFilter(null)} />
          <FilterChip label="Income" selected={typeFilter === 'income'} onPress={() => setTypeFilter('income')} />
          <FilterChip label="Expense" selected={typeFilter === 'expense'} onPress={() => setTypeFilter('expense')} />
        </View>

        <View style={styles.filterRow}>
          {PERIODS.map((p) => (
            <FilterChip
              key={p.key}
              label={p.label}
              selected={period === p.key}
              onPress={() => setPeriod(p.key)}
            />
          ))}
        </View>

        {/* Filter Row 2: Categories Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <FilterChip
            label="All Categories"
            selected={categoryFilter === null}
            onPress={() => setCategoryFilter(null)}
          />
          {ALL_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              selected={categoryFilter === cat.id}
              onPress={() => setCategoryFilter(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryCount}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </Text>
        <Text
          style={[
            styles.summaryNet,
            { color: net >= 0 ? colors.income : colors.expense },
          ]}
        >
          Net: {net >= 0 ? '+' : '-'}{formatCurrency(net, currency)}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="search-off"
            message="No matching transactions found"
            subMessage="Try adjusting your search query or clearing some filters."
          />
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn} activeOpacity={0.8}>
              <MaterialIcons name="clear-all" size={18} color={colors.white} />
              <Text style={styles.clearBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              currency={currency}
              onPress={() => navigation.navigate('TransactionDetails', { id: item.id })}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginHorizontal: spacing.lg,
    marginTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    fontSize: 15,
    color: colors.ink,
  },
  filtersWrapper: {
    marginTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: 6,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    gap: spacing.xs,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  summaryCount: {
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  summaryNet: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkMuted,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    marginTop: spacing.md,
    gap: 6,
  },
  clearBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
