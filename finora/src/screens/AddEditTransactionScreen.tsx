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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { colors, spacing, radius } from '../utils/theme';
import { getCategoriesForType } from '../utils/categories';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import CategoryChip from '../components/CategoryChip';

export default function AddEditTransactionScreen({ navigation, route }: { navigation: any; route: any }) {
  const { profile } = useAuth();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const editTransaction = route?.params?.transaction;

  const [type, setType] = useState(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [title, setTitle] = useState(editTransaction?.title || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [date, setDate] = useState(editTransaction ? new Date(editTransaction.date) : new Date());
  const [note, setNote] = useState(editTransaction?.note || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const currency = profile?.currency || '$';
  const categories = getCategoriesForType(type);

  useEffect(() => {
    if (!category || !categories.find((c) => c.id === category)) {
      setCategory('');
    }
  }, [type]);

  const isValid = parseFloat(amount) > 0 && title.trim().length > 0 && category.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const data = {
        type,
        amount: parseFloat(amount),
        title: title.trim(),
        category,
        date: date.toISOString(),
        note: note.trim(),
      };
      if (editTransaction) {
        await updateTransaction(editTransaction.id, data);
      } else {
        await addTransaction(data);
      }
      setSaved(true);
      setTimeout(() => navigation.goBack(), 800);
    } catch (err) {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete transaction', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(editTransaction.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editTransaction ? 'Edit' : 'Add'} Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.toggleActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.toggleActive]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{currency}</Text>
          <Text style={styles.amountInput}>{amount || '0.00'}</Text>
        </View>
        <AppInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          style={styles.amountField}
        />

        <AppInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder={type === 'expense' ? 'e.g. Grocery run' : 'e.g. Salary'}
        />

        <Text style={styles.label}>Category</Text>
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

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
          <MaterialIcons name="calendar-today" size={20} color={colors.brand} />
          <Text style={styles.dateText}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        <AppInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          multiline
        />

        {saved && (
          <View style={styles.savedBanner}>
            <MaterialIcons name="check-circle" size={20} color={colors.income} />
            <Text style={styles.savedText}>Saved!</Text>
          </View>
        )}

        <AppButton
          title={editTransaction ? 'Update' : 'Save'}
          onPress={handleSave}
          disabled={!isValid}
          loading={loading}
        />

        {editTransaction && (
          <AppButton title="Delete" variant="danger" onPress={handleDelete} style={styles.deleteBtn} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.chip,
    padding: 4,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.brand,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    marginRight: spacing.sm,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.ink,
  },
  amountField: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: 15,
    color: colors.ink,
    marginLeft: spacing.sm,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.incomeBg,
    padding: spacing.md,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
  },
  savedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.income,
    marginLeft: spacing.sm,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
