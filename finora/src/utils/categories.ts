import { Category } from '../types';

export const ALL_CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & Dining', icon: 'restaurant', color: '#E0A030' },
  { id: 'transport', label: 'Transport', icon: 'directions-car', color: '#4A90D9' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#7B68EE' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie', color: '#D9534F' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'receipt', color: '#2E9E6B' },
  { id: 'health', label: 'Health', icon: 'favorite', color: '#E91E63' },
  { id: 'education', label: 'Education', icon: 'school', color: '#3F51B5' },
  { id: 'travel', label: 'Travel', icon: 'flight', color: '#00BCD4' },
  { id: 'groceries', label: 'Groceries', icon: 'shopping-cart', color: '#4CAF50' },
  { id: 'salary', label: 'Salary', icon: 'account-balance', color: '#0E5A4A' },
  { id: 'freelance', label: 'Freelance', icon: 'work', color: '#FF9800' },
  { id: 'investments', label: 'Investments', icon: 'trending-up', color: '#009688' },
  { id: 'other', label: 'Other', icon: 'more-horiz', color: '#9E9E9E' },
];

export const EXPENSE_CATEGORIES = ALL_CATEGORIES.filter((c) =>
  ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'education', 'travel', 'groceries', 'other'].includes(c.id)
);

export const INCOME_CATEGORIES = ALL_CATEGORIES.filter((c) =>
  ['salary', 'freelance', 'investments', 'other'].includes(c.id)
);

export function getCategoriesForType(type: 'income' | 'expense'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryById(id: string): Category {
  return ALL_CATEGORIES.find((c) => c.id === id) || ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
}
