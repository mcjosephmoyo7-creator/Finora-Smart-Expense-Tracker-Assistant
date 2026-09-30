import { Category, IconName } from '../types';

export const ALL_CATEGORIES: Category[] = [
  // Expense categories (from project scope)
  { id: 'Groceries', label: 'Groceries', icon: 'shopping-cart', color: '#16A34A' },
  { id: 'Dining Out', label: 'Dining Out', icon: 'restaurant', color: '#F59E0B' },
  { id: 'Transport', label: 'Transport', icon: 'directions-car', color: '#3B82F6' },
  { id: 'Housing', label: 'Housing', icon: 'home', color: '#6366F1' },
  { id: 'Utilities', label: 'Utilities', icon: 'power', color: '#14B8A6' },
  { id: 'Health', label: 'Health', icon: 'favorite', color: '#EC4899' },
  { id: 'Shopping', label: 'Shopping', icon: 'shopping-bag', color: '#8B5CF6' },
  { id: 'Entertainment', label: 'Entertainment', icon: 'movie', color: '#EF4444' },
  { id: 'Education', label: 'Education', icon: 'school', color: '#06B6D4' },
  { id: 'Other', label: 'Other', icon: 'more-horiz', color: '#6B7280' },

  // Income categories (from project scope)
  { id: 'Salary', label: 'Salary', icon: 'payments', color: '#10B981' },
  { id: 'Freelance', label: 'Freelance', icon: 'laptop-mac', color: '#F59E0B' },
  { id: 'Gift', label: 'Gift', icon: 'card-giftcard', color: '#EC4899' },
  { id: 'Other Income', label: 'Other Income', icon: 'attach-money', color: '#3B82F6' },
];

export const EXPENSE_CATEGORIES = ALL_CATEGORIES.filter((c) =>
  ['Groceries', 'Dining Out', 'Transport', 'Housing', 'Utilities', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other'].includes(c.id)
);

export const INCOME_CATEGORIES = ALL_CATEGORIES.filter((c) =>
  ['Salary', 'Freelance', 'Gift', 'Other Income'].includes(c.id)
);

export function getCategoriesForType(type: 'income' | 'expense'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryById(id: string): Category {
  return (
    ALL_CATEGORIES.find((c) => c.id === id || c.label.toLowerCase() === (id || '').toLowerCase()) ||
    ALL_CATEGORIES.find((c) => c.id === 'Other') ||
    ALL_CATEGORIES[0]
  );
}
