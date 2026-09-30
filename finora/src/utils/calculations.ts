import { Transaction, PeriodKey, BudgetStatus } from '../types';

export function parseTransactionDate(d: any): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d.toDate === 'function') return d.toDate();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatCurrency(amount: number, currency = '$'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${currency}${Math.abs(safeAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
    0
  );
}

export function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNet(transactions: Transaction[]): number {
  return calculateIncome(transactions) - calculateExpenses(transactions);
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodKey | string
): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = parseTransactionDate(t.date);
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
        const day = (now.getDay() + 6) % 7; // Monday start
        start.setDate(start.getDate() - day);
        start.setHours(0, 0, 0, 0);
        return d >= start;
      }
      case 'this_month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'last_month': {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
      }
      case 'all_time':
      default:
        return true;
    }
  });
}

export function getTransactionsByCategory(
  transactions: Transaction[],
  type: 'income' | 'expense'
): { category: string; total: number; count: number }[] {
  const map: Record<string, { total: number; count: number }> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const cat = t.category || 'Other';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat].total += t.amount;
      map[cat].count += 1;
    });
  return Object.entries(map)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);
}

export function getAverageDailySpend(transactions: Transaction[], days: number): number {
  const expenses = calculateExpenses(transactions);
  const safeDays = Math.max(1, days);
  return expenses / safeDays;
}

export function getBiggestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max));
}

export function getTopCategory(
  transactions: Transaction[],
  type: 'income' | 'expense'
): { category: string; total: number; count: number } | null {
  const byCat = getTransactionsByCategory(transactions, type);
  if (byCat.length === 0) return null;
  return byCat[0];
}

export function getMonthOverMonthChange(thisMonth: number, lastMonth: number): number {
  if (lastMonth === 0) return 0;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

export function getBudgetStatus(
  transactions: Transaction[],
  monthlyBudget: number
): BudgetStatus {
  const now = new Date();
  const thisMonthExpenses = transactions.filter((t) => {
    const d = parseTransactionDate(t.date);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      t.type === 'expense'
    );
  });
  const spent = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);
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
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDay - now.getDate() + 1);
  return Math.max(0, remaining / daysLeft);
}
