import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  calculateIncome,
  calculateExpenses,
  calculateNet,
  getAverageDailySpend,
  getMonthOverMonthChange,
  filterTransactionsByPeriod,
} from '../utils/calculations';

export function useMonthStats(): {
  income: number;
  expenses: number;
  net: number;
  count: number;
  avgDailySpend: number;
  momChange: number;
  lastMonthExpenses: number;
} {
  const { transactions } = useTransactions();

  const stats = useMemo(() => {
    const thisMonth = filterTransactionsByPeriod(transactions, 'this_month');
    const lastMonth = filterTransactionsByPeriod(transactions, 'last_month');

    const income = calculateIncome(thisMonth);
    const expenses = calculateExpenses(thisMonth);
    const net = calculateNet(thisMonth);
    const count = thisMonth.length;
    const now = new Date();
    const daysPassed = Math.max(1, now.getDate());
    const avgDailySpend = getAverageDailySpend(thisMonth, daysPassed);

    const lastMonthExpenses = calculateExpenses(lastMonth);
    const momChange = getMonthOverMonthChange(expenses, lastMonthExpenses);

    return {
      income,
      expenses,
      net,
      count,
      avgDailySpend,
      momChange,
      lastMonthExpenses,
    };
  }, [transactions]);

  return stats;
}
