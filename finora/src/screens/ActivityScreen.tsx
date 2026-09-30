import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius } from '../utils/theme';
import { formatCurrency, calculateNet, filterTransactionsByPeriod } from '../utils/calculations';
import { getSectionLabel, isSameDay } from '../utils/dateHelpers';
import { ALL_CATEGORIES } from '../utils/categories';
import TransactionRow from '../components/TransactionRow';
import FilterChip from '../components/FilterChip';
import EmptyState from '../components/EmptyState';

const PERIODS = [
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'all_time', label: 'All time' },
];

export default function ActivityScreen({ navigation }: { navigation: any }) {
  const { profile } = useAuth();
  const { transactions, deleteTransaction } = useTransactions();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [period, setPeriod] = useState('this_month');

  const currency = profile?.currency || '$';

  const filtered = useMemo(() => {
    let result = filterTransactionsByPeriod(transactions, period);
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return result;
  }, [transactions, period, typeFilter, categoryFilter, search]);

  const sections = useMemo(() => {
    const grouped = {};
    filtered.forEach((tx) => {
      const label = getSectionLabel(tx.date);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(tx);
    });
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const net = useMemo(() => calculateNet(filtered), [filtered]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter(null);
    setCategoryFilter(null);
    setPeriod('this_month');
  };

  const handleDelete = (tx) => {
    Alert.alert('Delete transaction', `"${tx.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.inkFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.inkFaint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" selected={!typeFilter} onPress={() => setTypeFilter(null)} />
        <FilterChip label="Income" selected={typeFilter === 'income'} onPress={() => setTypeFilter('income')} />
        <FilterChip label="Expense" selected={typeFilter === 'expense'} onPress={() => setTypeFilter('expense')} />
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All categories" selected={!categoryFilter} onPress={() => setCategoryFilter(null)} />
        {ALL_CATEGORIES.slice(0, 6).map((cat) => (
          <FilterChip
            key={cat.id}
            label={cat.label}
            selected={categoryFilter === cat.id}
            onPress={() => setCategoryFilter(cat.id)}
          />
        ))}
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

      <Text style={styles.summary}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Net {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
      </Text>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-off"
          message="Nothing matches your filters."
          subMessage="Try adjusting your search or filters."
        />
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
        />
      )}
    </View>
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
    borderRadius: radius.input,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    fontSize: 15,
    color: colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  summary: {
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
