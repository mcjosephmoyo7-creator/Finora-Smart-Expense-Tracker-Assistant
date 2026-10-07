import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudgetStatus } from '../hooks/useBudgetStatus';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { formatCurrency, parseTransactionDate } from '../utils/calculations';
import { getDaysLeftInMonth } from '../utils/dateHelpers';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import AppButton from '../components/AppButton';
import BudgetProgressBar from '../components/BudgetProgressBar';
import SafeAreaScreen from '../components/SafeAreaScreen';

export default function BudgetsScreen({ navigation }: { navigation: any }) {
  const { profile, updateProfile } = useAuth();
  const { transactions } = useTransactions();
  const budgetStatus = useBudgetStatus();

  const [budgetInput, setBudgetInput] = useState(
    profile && profile.monthlyBudget > 0 ? profile.monthlyBudget.toString() : ''
  );
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    profile?.categoryLimits || {}
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catLimitInput, setCatLimitInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);

  const currency = profile?.currency || '$';
  const daysLeft = getDaysLeftInMonth();

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput) || 0;
    setSavingBudget(true);
    try {
      await updateProfile({ monthlyBudget: val });
      Alert.alert('Saved', 'Monthly budget updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not save budget.');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleSaveCategoryLimit = async (catId: string) => {
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

  const handleClearCategoryLimit = async (catId: string) => {
    const newLimits = { ...categoryLimits };
    delete newLimits[catId];
    setCategoryLimits(newLimits);
    try {
      await updateProfile({ categoryLimits: newLimits });
    } catch {
      Alert.alert('Error', 'Could not clear limit.');
    }
  };

  const statusColor =
    budgetStatus.status === 'over'
      ? colors.expense
      : budgetStatus.status === 'warning'
      ? colors.amber
      : colors.income;

  const statusLabel =
    budgetStatus.status === 'over'
      ? "You've exceeded your monthly budget"
      : budgetStatus.status === 'warning'
      ? `You've used ${budgetStatus.percent}% of your budget, spend carefully`
      : `You're on track (${budgetStatus.percent}% spent)`;

  return (
    <SafeAreaScreen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Monthly Budgets</Text>
          <View style={{ width: 40 }} />
        </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Set / Change Monthly Budget Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Set Monthly Spending Limit</Text>
          <Text style={styles.cardSubtitle}>
            Define your maximum planned spending for the entire month.
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
          <AppButton title="Save Budget Limit" onPress={handleSaveBudget} loading={savingBudget} />
        </View>

        {/* Overall Status Banner & Stats */}
        {budgetStatus.monthlyBudget > 0 && (
          <View style={styles.card}>
            <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
              <MaterialIcons
                name={budgetStatus.status === 'over' ? 'error-outline' : budgetStatus.status === 'warning' ? 'warning-amber' : 'check-circle-outline'}
                size={22}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>

            <View style={styles.progressSection}>
              <BudgetProgressBar percent={budgetStatus.percent} status={budgetStatus.status} />
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatCurrency(budgetStatus.spent, currency)}</Text>
                <Text style={styles.statLabel}>Spent so far</Text>
              </View>
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.statValue,
                    { color: budgetStatus.remaining < 0 ? colors.expense : colors.income },
                  ]}
                >
                  {formatCurrency(Math.abs(budgetStatus.remaining), currency)}
                </Text>
                <Text style={styles.statLabel}>
                  {budgetStatus.remaining < 0 ? 'Over budget' : 'Remaining'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {formatCurrency(budgetStatus.dailySafeToSpend, currency)}
                </Text>
                <Text style={styles.statLabel}>Daily safe-to-spend</Text>
              </View>
            </View>

            <Text style={styles.daysLeft}>
              {daysLeft} day{daysLeft > 1 ? 's' : ''} left in this month
            </Text>
          </View>
        )}

        {/* Category Limits Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Limits (Optional)</Text>
          <Text style={styles.cardSubtitle}>
            Set targeted limits for individual categories to keep specific habits in check.
          </Text>

          {EXPENSE_CATEGORIES.map((cat) => {
            const limit = categoryLimits[cat.id] || 0;
            const now = new Date();
            const spent = transactions
              .filter((t) => {
                const d = parseTransactionDate(t.date);
                return (
                  t.type === 'expense' &&
                  (t.category === cat.id || t.category === cat.label) &&
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              })
              .reduce((s, t) => s + t.amount, 0);

            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const isOver = limit > 0 && spent >= limit;

            return (
              <View key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.catIconBox, { backgroundColor: cat.color + '15' }]}>
                      <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.label}</Text>
                  </View>

                  {editingCategory === cat.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.catInput}
                        value={catLimitInput}
                        onChangeText={setCatLimitInput}
                        placeholder="Limit"
                        keyboardType="decimal-pad"
                        placeholderTextColor={colors.inkFaint}
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={() => handleSaveCategoryLimit(cat.id)}
                        style={styles.iconBtn}
                      >
                        <MaterialIcons name="check" size={20} color={colors.income} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditingCategory(null)}
                        style={styles.iconBtn}
                      >
                        <MaterialIcons name="close" size={20} color={colors.inkFaint} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.categoryActions}>
                      {limit > 0 && (
                        <Text style={[styles.limitText, isOver && styles.limitTextOver]}>
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
                        <MaterialIcons
                          name={limit > 0 ? 'edit' : 'add-circle-outline'}
                          size={20}
                          color={colors.brand}
                        />
                      </TouchableOpacity>
                      {limit > 0 && (
                        <TouchableOpacity
                          onPress={() => handleClearCategoryLimit(cat.id)}
                          style={styles.iconBtn}
                        >
                          <MaterialIcons name="delete-outline" size={20} color={colors.expense} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {limit > 0 && (
                  <View style={styles.miniBar}>
                    <View
                      style={[
                        styles.miniBarFill,
                        {
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor: isOver ? colors.expense : cat.color,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
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
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.input,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  daysLeft: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  categoryItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginLeft: spacing.sm,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.inkMuted,
    marginRight: spacing.xs,
  },
  limitTextOver: {
    color: colors.expense,
    fontWeight: '700',
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
    paddingVertical: 4,
    fontSize: 14,
    width: 80,
    marginRight: spacing.xs,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  miniBar: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
