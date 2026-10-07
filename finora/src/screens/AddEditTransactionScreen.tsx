import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { getCategoriesForType } from '../utils/categories';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import CategoryChip from '../components/CategoryChip';
import { Transaction } from '../types';
import SafeAreaScreen from '../components/SafeAreaScreen';

export default function AddEditTransactionScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { profile } = useAuth();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const editTransaction: Transaction | undefined = route?.params?.transaction;

  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount ? editTransaction.amount.toString() : '');
  const [title, setTitle] = useState(editTransaction?.title || '');
  const [category, setCategory] = useState(editTransaction?.category || ''); // eslint-disable-line react-hooks/set-state-in-effect
  const [date, setDate] = useState<Date>(
    editTransaction?.date ? new Date(editTransaction.date) : new Date()
  );
  const [note, setNote] = useState(editTransaction?.note || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const currency = profile?.currency || '$';
  const categories = getCategoriesForType(type);

  useEffect(() => {
    if (!category || !categories.find((c) => c.id === category)) {
      setCategory(categories[0]?.id || '');
    }
  }, [type, categories, category]);

  const numAmount = parseFloat(amount);
  const isValid = !isNaN(numAmount) && numAmount > 0 && title.trim().length > 0 && category.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const data = {
        type,
        amount: numAmount,
        title: title.trim(),
        category,
        date: date,
        note: note.trim(),
      };

      if (editTransaction) {
        await updateTransaction(editTransaction.id, data);
      } else {
        await addTransaction(data);
      }
      setSaved(true);
      setTimeout(() => navigation.goBack(), 600);
    } catch (err) {
      Alert.alert('Error', 'Could not save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!editTransaction) return;
    Alert.alert('Delete transaction', `Are you sure you want to remove "${editTransaction.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(editTransaction.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', 'Could not delete transaction.');
          }
        },
      },
    ]);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

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
          style={styles.closeBtn}
        >
          <MaterialIcons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editTransaction ? 'Edit' : 'Add'} Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.toggleActiveExpense]}
            onPress={() => setType('expense')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.toggleActiveIncome]}
            onPress={() => setType('income')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Large Amount Input */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                // Allow only numbers and a single decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');
                setAmount(cleaned);
              }}
              placeholder="0.00"
              placeholderTextColor={colors.inkFaint}
              keyboardType="decimal-pad"
              autoFocus={!editTransaction}
            />
          </View>
        </View>

        {/* Title */}
        <AppInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder={type === 'expense' ? 'e.g. Supermarket, Coffee, Uber' : 'e.g. Monthly salary, Freelance design'}
        />

        {/* Category Picker */}
        <View style={styles.categorySection}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={category === cat.id}
                onPress={() => setCategory(cat.id)}
              />
            ))}
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="calendar-today" size={20} color={colors.brand} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={22} color={colors.inkMuted} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Optional Note */}
        <AppInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Add details, receipt reference, etc."
          multiline
        />

        {saved && (
          <View style={styles.savedBanner}>
            <MaterialIcons name="check-circle" size={20} color={colors.income} />
            <Text style={styles.savedText}>Saved successfully!</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <AppButton
            title={editTransaction ? 'Save Changes' : 'Add Transaction'}
            onPress={handleSave}
            disabled={!isValid || loading}
            loading={loading}
          />

          {editTransaction && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} activeOpacity={0.7}>
              <MaterialIcons name="delete-outline" size={20} color={colors.expense} />
              <Text style={styles.deleteButtonText}>Delete Transaction</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.card - 4,
  },
  toggleActiveExpense: {
    backgroundColor: colors.expense,
  },
  toggleActiveIncome: {
    backgroundColor: colors.income,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    marginRight: spacing.xs,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.ink,
    minWidth: 120,
    textAlign: 'left',
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
    marginLeft: spacing.md,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.incomeBg,
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  savedText: {
    color: colors.income,
    fontWeight: '700',
    fontSize: 15,
  },
  actionRow: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  deleteButtonText: {
    color: colors.expense,
    fontSize: 15,
    fontWeight: '600',
  },
});
