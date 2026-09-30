import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudgetStatus } from '../hooks/useBudgetStatus';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { formatCurrency } from '../utils/calculations';
import { getDaysLeftInMonth } from '../utils/dateHelpers';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import AppButton from '../components/AppButton';
import BudgetProgressBar from '../components/BudgetProgressBar';

export default function BudgetsScreen({ navigation }: { navigation: any }) {
  const { profile, updateProfile } = useAuth();
  const { transactions } = useTransactions();
  const budgetStatus = useBudgetStatus();

  const [budgetInput, setBudgetInput] = useState(
    profile?.monthlyBudget > 0 ? profile.monthlyBudget.toString() : ''
  );
  const [categoryLimits, setCategoryLimits] = useState(profile?.categoryLimits || {});
  const [editingCategory, setEditingCategory] = useState(null);
  const [catLimitInput, setCatLimitInput] = useState('');

  const currency = profile?.currency || '$';
  const daysLeft = getDaysLeftInMonth();

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput) || 0;
    try {
      await updateProfile({ monthlyBudget: val });
      Alert.alert('Saved', 'Monthly budget updated.');
    } catch {
      Alert.alert('Error', 'Could not save budget.');
    }
  };

  const handleSaveCategoryLimit = async (catId) => {
    const val = parseFloat(catLimitInput) || 0;
    const newLimits = { ...categoryLimits };
    if (val > 0) {
      newLimits[catId] = val;
    } else {
      delete newLimits[catId];
    }
    setCategoryLimits(newLimits);
    setEditingCategory(null);
    setCatLimitInput('');
    try {
      await updateProfile({ categoryLimits: newLimits });
    } catch {
      Alert.alert('Error', 'Could not save category limit.');
    }
  };

  const handleClearCategoryLimit = async (catId) => {
    const newLimits = { ...categoryLimits };
    delete newLimits[catId];
    setCategoryLimits(newLimits);
    try {
      await updateProfile({ categoryLimits: newLimits });
    } catch {
      Alert.alert('Error', 'Could not clear limit.');
    }
  };

  const statusColor = budgetStatus.status === 'over' ? colors.expense : budgetStatus.status === 'warning' ? colors.amber : colors.income;
  const statusLabel = budgetStatus.status === 'over' ? 'Over budget' : budgetStatus.status === 'warning' ? 'Approaching limit' : 'On track';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budgets</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly budget</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
          <AppButton title="Save Budget" onPress={handleSaveBudget} />
        </View>

        {budgetStatus.monthlyBudget > 0 && (
          <View style={styles.card}>
            <View style={styles.statusBanner}>
              <MaterialIcons
                name={budgetStatus.status === 'over' ? 'warning' : 'check-circle'}
                size={20}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel} — {budgetStatus.percent}%
              </Text>
            </View>
            <BudgetProgressBar percent={budgetStatus.percent} status={budgetStatus.status} />
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatCurrency(budgetStatus.spent, currency)}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: budgetStatus.remaining < 0 ? colors.expense : colors.income }]}>
                  {formatCurrency(Math.abs(budgetStatus.remaining), currency)}
                </Text>
                <Text style={styles.statLabel}>{budgetStatus.remaining < 0 ? 'Over' : 'Remaining'}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatCurrency(budgetStatus.dailySafeToSpend, currency)}</Text>
                <Text style={styles.statLabel}>Safe/day</Text>
              </View>
            </View>
            <Text style={styles.daysLeft}>{daysLeft} days left this month</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category limits</Text>
          {EXPENSE_CATEGORIES.map((cat) => {
            const limit = categoryLimits[cat.id];
            const spent = transactions
              .filter((t) => t.type === 'expense' && t.category === cat.id && new Date(t.date).getMonth() === new Date().getMonth())
              .reduce((s, t) => s + t.amount, 0);
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const isOver = limit > 0 && spent > limit;

            return (
              <View key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                    <Text style={styles.categoryName}>{cat.label}</Text>
                  </View>
                  {editingCategory === cat.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.catInput}
                        value={catLimitInput}
                        onChangeText={setCatLimitInput}
                        placeholder="Limit"
                        keyboardType="numeric"
                        placeholderTextColor={colors.inkFaint}
                      />
                      <TouchableOpacity onPress={() => handleSaveCategoryLimit(cat.id)} style={styles.iconBtn}>
                        <MaterialIcons name="check" size={18} color={colors.income} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditingCategory(null)} style={styles.iconBtn}>
                        <MaterialIcons name="close" size={18} color={colors.inkFaint} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.categoryActions}>
                      {limit > 0 && (
                        <Text style={[styles.limitText, isOver && { color: colors.expense }]}>
                          {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCategory(cat.id);
                          setCatLimitInput(limit > 0 ? limit.toString() : '');
                        }}
                        style={styles.iconBtn}
                      >
                        <MaterialIcons name="edit" size={18} color={colors.brand} />
                      </TouchableOpacity>
                      {limit > 0 && (
                        <TouchableOpacity onPress={() => handleClearCategoryLimit(cat.id)} style={styles.iconBtn}>
                          <MaterialIcons name="delete" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                {limit > 0 && (
                  <View style={styles.miniBar}>
                    <View style={[styles.miniBarFill, { width: `${Math.min(100, pct)}%`, backgroundColor: isOver ? colors.expense : cat.color }]} />
                  </View>
                )}
              </View>
            );
          })}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  daysLeft: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  categoryItem: {
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    marginLeft: spacing.sm,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitText: {
    fontSize: 13,
    color: colors.inkMuted,
    marginRight: spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    width: 80,
    marginRight: spacing.sm,
    color: colors.ink,
  },
  iconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  miniBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
