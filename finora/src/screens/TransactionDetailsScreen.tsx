import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/calculations';
import { formatDate } from '../utils/dateHelpers';
import AppButton from '../components/AppButton';

export default function TransactionDetailsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { profile } = useAuth();
  const { transactions, deleteTransaction } = useTransactions();
  const { id } = route?.params || {};

  const transaction = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.missing}>
          <MaterialIcons name="receipt-long" size={54} color={colors.inkFaint} />
          <Text style={styles.missingTitle}>Transaction Not Found</Text>
          <Text style={styles.missingText}>
            This entry may have been removed or is no longer available.
          </Text>
          <AppButton title="Return to Activity" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';
  const currency = profile?.currency || '$';

  const handleDelete = () => {
    Alert.alert('Delete transaction', `Are you sure you want to delete "${transaction.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', 'Could not delete transaction.');
          }
        },
      },
    ]);
  };

  const getCreatedDateText = () => {
    if (transaction.createdAt?.toDate) {
      return formatDate(transaction.createdAt.toDate());
    }
    if (transaction.createdAt) {
      return formatDate(transaction.createdAt);
    }
    return 'Recent';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEditTransaction', { transaction })}
          style={styles.editHeaderBtn}
        >
          <MaterialIcons name="edit" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Amount Card */}
        <View style={styles.amountCard}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg },
            ]}
          >
            <MaterialIcons
              name={category.icon}
              size={32}
              color={isIncome ? colors.income : colors.expense}
            />
          </View>
          <Text
            style={[
              styles.amountText,
              { color: isIncome ? colors.income : colors.expense },
            ]}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
          </Text>
          <Text style={styles.titleText}>{transaction.title}</Text>

          <View
            style={[
              styles.typePill,
              { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg },
            ]}
          >
            <Text
              style={[
                styles.typePillText,
                { color: isIncome ? colors.income : colors.expense },
              ]}
            >
              {isIncome ? 'Income' : 'Expense'}
            </Text>
          </View>
        </View>

        {/* Detailed Information */}
        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Category</Text>
            <View style={styles.rowValue}>
              <MaterialIcons name={category.icon} size={16} color={category.color} />
              <Text style={styles.rowText}>{category.label}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowText}>{formatDate(transaction.date)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Note</Text>
            <Text style={[styles.rowText, !transaction.note && styles.rowTextMuted]}>
              {transaction.note ? transaction.note : 'No note added'}
            </Text>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Logged on</Text>
            <Text style={styles.rowText}>{getCreatedDateText()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            title="Edit Transaction"
            variant="secondary"
            onPress={() => navigation.navigate('AddEditTransaction', { transaction })}
          />
          <AppButton title="Delete Transaction" variant="danger" onPress={handleDelete} />
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
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  editHeaderBtn: {
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
  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  categoryBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  typePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.chip,
    marginTop: spacing.sm,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '500',
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginLeft: 6,
  },
  rowTextMuted: {
    color: colors.inkFaint,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  actions: {
    gap: spacing.md,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  missingText: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
