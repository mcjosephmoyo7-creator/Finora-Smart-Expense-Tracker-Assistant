import { useMemo } from 'react';
import { useTransactions as useTransactionsContext } from '../context/TransactionContext';
import { filterTransactionsByPeriod } from '../utils/calculations';
import { Transaction, PeriodKey } from '../types';

export function useTransactions(period: PeriodKey = 'all_time'): {
  transactions: Transaction[];
  allTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
} {
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } =
    useTransactionsContext();

  const filtered = useMemo(() => {
    return filterTransactionsByPeriod(transactions, period);
  }, [transactions, period]);

  return {
    transactions: filtered,
    allTransactions: transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
