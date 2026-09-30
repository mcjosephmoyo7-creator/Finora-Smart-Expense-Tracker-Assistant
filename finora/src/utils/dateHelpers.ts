export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getMonthName(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getSectionLabel(date: Date | string | any): string {
  const d = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function isSameDay(d1: any, d2: any): boolean {
  const a = d1 instanceof Date ? d1 : (d1?.toDate ? d1.toDate() : new Date(d1));
  const b = d2 instanceof Date ? d2 : (d2?.toDate ? d2.toDate() : new Date(d2));
  return a.toDateString() === b.toDateString();
}

export function formatDate(date: any): string {
  const d = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(date: any): string {
  const d = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}
