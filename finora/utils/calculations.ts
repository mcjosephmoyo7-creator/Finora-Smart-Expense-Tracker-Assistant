import { Transaction, PeriodKey, BudgetStatus } from '../types';

export function formatCurrency(amount: number, currency = '$'): string {
  const num = Math.abs(amount);
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
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

export function getTransactionsByCategory(transactions: Transaction[], type = 'expense'): { category: string; total: number; count: number }[] {
  const filtered = transactions.filter((t) => t.type === type);
  const byCategory = {};
  filtered.forEach((t) => {
    if (!byCategory[t.category]) {
      byCategory[t.category] = { category: t.category, total: 0, count: 0 };
    }
    byCategory[t.category].total += t.amount;
    byCategory[t.category].count += 1;
  });
  return Object.values(byCategory).sort((a, b) => b.total - a.total);
}

export function getTopCategory(transactions: Transaction[], type = 'expense'): { category: string; total: number; count: number } | null {
  const byCategory = getTransactionsByCategory(transactions, type);
  return byCategory.length > 0 ? byCategory[0] : null;
}

export function getBiggestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
}

export function getAverageDailySpend(transactions: Transaction[], days = 30): number {
  const expenses = calculateExpenses(transactions);
  return expenses / days;
}

export function getBudgetStatus(transactions: Transaction[], monthlyBudget: number): BudgetStatus {
  if (!monthlyBudget || monthlyBudget <= 0) {
    return { spent: 0, remaining: 0, percent: 0, status: 'none' };
  }
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const spent = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyBudget - spent;
  const percent = Math.round((spent / monthlyBudget) * 100);
  let status = 'on-track';
  if (percent >= 100) status = 'over';
  else if (percent >= 75) status = 'warning';
  return { spent, remaining, percent, status };
}

export function getDailySafeToSpend(transactions: Transaction[], monthlyBudget: number): number {
  const { remaining } = getBudgetStatus(transactions, monthlyBudget);
  const daysLeft = getDaysLeftInMonthSafe();
  return Math.max(0, remaining) / daysLeft;
}

function getDaysLeftInMonthSafe() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

export function getMonthOverMonthChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function filterTransactionsByPeriod(transactions: Transaction[], period: PeriodKey): Transaction[] {
  const now = new Date();
  switch (period) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return transactions.filter((t) => new Date(t.date) >= start);
    }
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }
    case 'this_week': {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return transactions.filter((t) => new Date(t.date) >= start);
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return transactions.filter((t) => new Date(t.date) >= start);
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }
    case 'all_time':
    default:
      return transactions;
  }
}
