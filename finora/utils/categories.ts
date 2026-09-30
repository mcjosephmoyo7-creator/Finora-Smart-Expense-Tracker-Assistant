import { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'housing', label: 'Housing', icon: 'home', color: '#0E5A4A' },
  { id: 'groceries', label: 'Groceries', icon: 'shopping-cart', color: '#2E9E6B' },
  { id: 'dining', label: 'Dining Out', icon: 'restaurant', color: '#E0A030' },
  { id: 'transport', label: 'Transport', icon: 'directions-car', color: '#4A90D9' },
  { id: 'utilities', label: 'Utilities', icon: 'power', color: '#7B68EE' },
  { id: 'health', label: 'Health', icon: 'favorite', color: '#D9534F' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie', color: '#E0A030' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#D9534F' },
  { id: 'education', label: 'Education', icon: 'school', color: '#4A90D9' },
  { id: 'personal', label: 'Personal Care', icon: 'spa', color: '#2E9E6B' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'repeat', color: '#7B68EE' },
  { id: 'other_expense', label: 'Other', icon: 'more-horiz', color: '#8A9691' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', label: 'Salary', icon: 'account-balance-wallet', color: '#2E9E6B' },
  { id: 'freelance', label: 'Freelance', icon: 'work', color: '#0E5A4A' },
  { id: 'business', label: 'Business', icon: 'business-center', color: '#4A90D9' },
  { id: 'investments', label: 'Investments', icon: 'trending-up', color: '#E0A030' },
  { id: 'gifts', label: 'Gifts', icon: 'card-giftcard', color: '#D9534F' },
  { id: 'other_income', label: 'Other', icon: 'more-horiz', color: '#8A9691' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category {
  return ALL_CATEGORIES.find((c) => c.id === id) || ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
}

export function getCategoriesForType(type: 'income' | 'expense'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const CATEGORY_SYNONYMS = {
  food: ['groceries', 'dining'],
  groceries: ['groceries'],
  dining: ['dining'],
  restaurant: ['dining'],
  eat: ['dining'],
  lunch: ['dining'],
  dinner: ['dining'],
  breakfast: ['dining'],
  transport: ['transport'],
  bus: ['transport'],
  uber: ['transport'],
  taxi: ['transport'],
  train: ['transport'],
  gas: ['transport'],
  fuel: ['transport'],
  housing: ['housing'],
  rent: ['housing'],
  mortgage: ['housing'],
  utilities: ['utilities'],
  electric: ['utilities'],
  electricity: ['utilities'],
  water: ['utilities'],
  internet: ['utilities'],
  phone: ['utilities'],
  health: ['health'],
  doctor: ['health'],
  medical: ['health'],
  pharmacy: ['health'],
  entertainment: ['entertainment'],
  movie: ['entertainment'],
  movies: ['entertainment'],
  netflix: ['entertainment'],
  spotify: ['entertainment'],
  fun: ['entertainment'],
  shopping: ['shopping'],
  clothes: ['shopping'],
  clothing: ['shopping'],
  amazon: ['shopping'],
  education: ['education'],
  school: ['education'],
  books: ['education'],
  course: ['education'],
  personal: ['personal'],
  haircut: ['personal'],
  subscriptions: ['subscriptions'],
  subscription: ['subscriptions'],
  salary: ['salary'],
  freelance: ['freelance'],
  business: ['business'],
  investments: ['investments'],
  gifts: ['gifts'],
  gift: ['gifts'],
};
