import { MaterialIcons } from '@expo/vector-icons';

export type IconName = keyof typeof MaterialIcons.glyphMap;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  note?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Profile {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  categoryLimits: Record<string, number>;
  createdAt?: any;
}

export interface Category {
  id: string;
  label: string;
  icon: IconName;
  color: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

export type PeriodKey = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'all_time';

export interface BudgetStatus {
  spent: number;
  remaining: number;
  percent: number;
  status: 'none' | 'on-track' | 'warning' | 'over';
}
