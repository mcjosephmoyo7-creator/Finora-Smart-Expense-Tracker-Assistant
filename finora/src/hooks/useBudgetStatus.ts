import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getBudgetStatus, getDailySafeToSpend } from '../utils/calculations';
import { getDaysLeftInMonth } from '../utils/dateHelpers';
import { BudgetStatus } from '../types';

export function useBudgetStatus(): BudgetStatus & { monthlyBudget: number; dailySafeToSpend: number; daysLeft: number } {
  const { transactions } = useTransactions();
  const { profile } = useAuth();

  const monthlyBudget = profile?.monthlyBudget || 0;

  const budgetStatus = useMemo(() => {
    return getBudgetStatus(transactions, monthlyBudget);
  }, [transactions, monthlyBudget]);

  const dailySafeToSpend = useMemo(() => {
    return getDailySafeToSpend(transactions, monthlyBudget);
  }, [transactions, monthlyBudget]);

  const daysLeft = useMemo(() => getDaysLeftInMonth(), []);

  return {
    monthlyBudget,
    ...budgetStatus,
    dailySafeToSpend,
    daysLeft,
  };
}
