import { Transaction, PeriodKey } from '../types';

export function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
}

export function calculateIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
}

export function calculateExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNet(transactions: Transaction[]): number {
  return calculateIncome(transactions) - calculateExpenses(transactions);
}

export function filterTransactionsByPeriod(transactions: Transaction[], period: PeriodKey | string): Transaction {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    switch (period) {
      case 'today':
        return d.toDateString() === now.toDateString();
      case 'yesterday': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return d.toDateString() === y.toDateString();
      }
      case 'this_week': {
        const start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        return d >= start;
      }
      case 'this_month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'last_month': {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
      }
      case 'all_time':
      default:
        return true;
    }
  });
}

export function getTransactionsByCategory(transactions: Transaction[], type: 'income' | 'expense'): { category: string; total: number; count: number }[] {
  const map: Record<string, { total: number; count: number }> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
      map[t.category].total += t.amount;
      map[t.category].count += 1;
    });
  return Object.entries(map).map(([category, data]) => ({ category, ...data }));
}

export function getAverageDailySpend(transactions: Transaction[], days: number): number {
  const expenses = calculateExpenses(transactions);
  return expenses / days;
}

export function getBiggestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max));
}

export function getTopCategory(transactions: Transaction[], type: 'income' | 'expense'): { category: string; total: number; count: number } | null {
  const byCat = getTransactionsByCategory(transactions, type);
  if (byCat.length === 0) return null;
  return byCat.reduce((top, c) => (c.total > top.total ? c : top));
}

export function getMonthOverMonthChange(thisMonth: number, lastMonth: number): number {
  if (lastMonth === 0) return 0;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

export function getBudgetStatus(transactions: Transaction[], monthlyBudget: number): { spent: number; remaining: number; percent: number; status: 'none' | 'on-track' | 'warning' | 'over' } {
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
  });
  const spent = thisMonth.reduce((s, t) => s + t.amount, 0);
  const remaining = monthlyBudget - spent;
  const percent = monthlyBudget > 0 ? Math.round((spent / monthlyBudget) * 100) : 0;
  let status: 'none' | 'on-track' | 'warning' | 'over' = 'none';
  if (monthlyBudget > 0) {
    if (percent >= 100) status = 'over';
    else if (percent >= 75) status = 'warning';
    else status = 'on-track';
  }
  return { spent, remaining, percent, status };
}

export function getDailySafeToSpend(transactions: Transaction[], monthlyBudget: number): number {
  const { remaining } = getBudgetStatus(transactions, monthlyBudget);
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  if (daysLeft <= 0) return 0;
  return Math.max(0, remaining / daysLeft);
}
