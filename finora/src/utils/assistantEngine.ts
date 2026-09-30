// Finora assistant: rule-based, but flexible. All numbers come from the user's real transactions.

import { Transaction, Profile } from '../types';

const DAY = 86400000;
const startOfDay = (d: Date): Date => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const toDate = (t: Transaction): Date => (t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date));

// words people actually use -> real category names
const CATEGORY_WORDS: Record<string, string[]> = {
  Groceries: ['grocery', 'groceries', 'supermarket', 'food shopping', 'food'],
  'Dining Out': ['dining', 'restaurant', 'eating out', 'takeaway', 'coffee', 'lunch', 'dinner', 'fast food'],
  Transport: ['transport', 'bus', 'taxi', 'uber', 'fuel', 'petrol', 'gas', 'fare', 'commute'],
  Housing: ['housing', 'rent', 'mortgage', 'house'],
  Utilities: ['utilities', 'utility', 'electricity', 'water', 'wifi', 'internet', 'airtime', 'bills', 'bill'],
  Health: ['health', 'medical', 'doctor', 'pharmacy', 'medicine', 'clinic'],
  Shopping: ['shopping', 'clothes', 'clothing', 'shoes'],
  Entertainment: ['entertainment', 'movies', 'movie', 'games', 'netflix', 'fun', 'music'],
  Education: ['education', 'school', 'fees', 'tuition', 'books', 'course'],
  Other: ['other', 'misc', 'miscellaneous'],
  Salary: ['salary', 'wage', 'paycheck', 'pay'],
  Freelance: ['freelance', 'gig', 'side job', 'side hustle'],
  Gift: ['gift', 'gifts'],
  'Other Income': ['other income'],
};

export const SUGGESTIONS = ["What's my balance?", 'Spending this month', 'Top category', 'Am I on budget?'];

interface Period {
  label: string;
  start: Date;
  end: Date;
  isDefault?: boolean;
}

function detectPeriod(q: string, now: Date): Period {
  const today = startOfDay(now);
  if (/\btoday\b/.test(q)) return { label: 'today', start: today, end: new Date(+today + DAY) };
  if (/\byesterday\b/.test(q)) return { label: 'yesterday', start: new Date(+today - DAY), end: today };
  if (/last month|previous month/.test(q))
    return { label: 'last month', start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 1) };
  if (/this week|past week|last 7 days|\bweek\b/.test(q)) {
    const back = (today.getDay() + 6) % 7; // Monday start
    return { label: 'this week', start: new Date(+today - back * DAY), end: new Date(+today + DAY) };
  }
  if (/all time|ever|overall|in total|altogether/.test(q)) return { label: 'all time', start: new Date(0), end: new Date(8.64e15) };
  return { label: 'this month', start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 1), isDefault: true };
}

function detectCategory(q: string): string | null {
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (words.some((w) => new RegExp(`\\b${w}\\b`).test(q))) return cat;
  }
  return null;
}

const sum = (list: Transaction[]): number => list.reduce((s, t) => s + t.amount, 0);
const inRange = (list: Transaction[], p: Period): Transaction[] => list.filter((t) => { const d = toDate(t); return d >= p.start && d < p.end; });

function byCategory(expenses: Transaction[]): { category: string; total: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return Object.entries(map).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

export function getReply(question: string, transactions: Transaction[] = [], profile: Profile = {} as Profile, now: Date = new Date()): string {
  const q = question.toLowerCase().trim();
  const cur = profile.currency || '$';
  const money = (n: number): string => `${cur}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (n: number): string => `${Math.round(n)}%`;

  if (transactions.length === 0 && !/\b(hi|hello|hey|help|thanks|thank)\b/.test(q))
    return "You haven't added any transactions yet. Tap the + button to log your first income or expense, and then ask me again.";

  const period = detectPeriod(q, now);
  const category = detectCategory(q);
  const inPeriod = inRange(transactions, period);
  const expenses = inPeriod.filter((t) => t.type === 'expense');
  const income = inPeriod.filter((t) => t.type === 'income');
  const allIncome = sum(transactions.filter((t) => t.type === 'income'));
  const allExpense = sum(transactions.filter((t) => t.type === 'expense'));

  // greetings and small talk
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q))
    return `Hi ${(profile.name || '').split(' ')[0] || 'there'}! Ask me about your balance, spending, budget or a category.`;
  if (/\b(thanks|thank you|cheers)\b/.test(q)) return 'Any time! Ask me anything else about your money.';
  if (/\b(help|what can you do)\b/.test(q))
    return 'I can tell you your balance, income, spending by category or period, your top category, biggest expense, budget status, and a full summary. Try "How much did I spend on food last month?"';

  // budget
  if (/budget|overspend|safe to spend|can i afford|left to spend/.test(q)) {
    const limit = profile.monthlyBudget || 0;
    if (!limit) return 'You have not set a monthly budget yet. Open Budgets and set one, then I can track it for you.';
    const month = detectPeriod('this month', now);
    const spent = sum(inRange(transactions, month).filter((t) => t.type === 'expense'));
    const percent = (spent / limit) * 100;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate() + 1;
    const remaining = limit - spent;
    const level = percent >= 100 ? 'over budget' : percent >= 75 ? 'getting close' : 'on track';
    let out = `You've spent ${money(spent)} of your ${money(limit)} budget (${pct(percent)}), so you're ${level}.`;
    out += remaining > 0
      ? ` You have ${money(remaining)} left, which is about ${money(remaining / daysLeft)} a day for the next ${daysLeft} days.`
      : ` You're ${money(Math.abs(remaining))} over the limit.`;
    const limits = profile.categoryLimits || {};
    const over = Object.entries(limits).filter(([c, l]) => sum(inRange(transactions, month).filter((t) => t.type === 'expense' && t.category === c)) >= l).map(([c]) => c);
    if (over.length) out += ` Watch out: ${over.join(', ')} ${over.length > 1 ? 'are' : 'is'} over its limit.`;
    return out;
  }

  // summary
  if (/summar|overview|report|how am i doing|how'?s my money/.test(q)) {
    const top = byCategory(expenses).slice(0, 3);
    let out = `Here's ${period.label}: income ${money(sum(income))}, expenses ${money(sum(expenses))}, net ${money(sum(income) - sum(expenses))}.`;
    if (top.length) out += ` Top spending: ${top.map((c) => `${c.category} (${money(c.total)})`).join(', ')}.`;
    return out;
  }

  // balance
  if (/balance|how much (money )?do i have|net worth|what do i have/.test(q))
    return `Your balance is ${money(allIncome - allExpense)}. That's ${money(allIncome)} earned minus ${money(allExpense)} spent, all time.`;

  // comparison
  if (/compar|vs|versus|than last month|more than|less than/.test(q)) {
    const thisM = sum(inRange(transactions, detectPeriod('this month', now)).filter((t) => t.type === 'expense'));
    const lastM = sum(inRange(transactions, detectPeriod('last month', now)).filter((t) => t.type === 'expense'));
    if (!lastM) return `You've spent ${money(thisM)} this month, and there's no spending recorded last month to compare with.`;
    const change = ((thisM - lastM) / lastM) * 100;
    return `This month you've spent ${money(thisM)} versus ${money(lastM)} last month, which is ${pct(Math.abs(change))} ${change > 0 ? 'more' : 'less'}.`;
  }

  // biggest expense
  if (/biggest|largest|highest expense|most expensive|single/.test(q)) {
    if (!expenses.length) return `No expenses recorded for ${period.label}.`;
    const big = expenses.reduce((a, b) => (b.amount > a.amount ? b : a));
    return `Your biggest expense ${period.label} was "${big.title}" at ${money(big.amount)} (${big.category}).`;
  }

  // top category
  if (/most|top|where|biggest category|main/.test(q) && /money|spend|categor|go|goes|going/.test(q)) {
    const groups = byCategory(expenses);
    if (!groups.length) return `No expenses recorded for ${period.label}.`;
    const total = sum(expenses);
    return `Most of your money ${period.label} went to ${groups[0].category}: ${money(groups[0].total)}, which is ${pct((groups[0].total / total) * 100)} of your spending.` +
      (groups[1] ? ` Next is ${groups[1].category} at ${money(groups[1].total)}.` : '');
  }

  // average daily
  if (/average|per day|daily|a day/.test(q)) {
    const end = period.end < now ? period.end : new Date(+startOfDay(now) + DAY);
    const days = Math.max(1, Math.round((end.getTime() - period.start.getTime()) / DAY));
    return `You spend about ${money(sum(expenses) / days)} a day ${period.label} (${money(sum(expenses))} over ${days} day${days > 1 ? 's' : ''}).`;
  }

  // income
  if (/earn|income|salary|received|got paid|made/.test(q) && !/spen|spent/.test(q)) {
    const list = category ? income.filter((t) => t.category === category) : income;
    return `You earned ${money(sum(list))} ${period.label}${category ? ` from ${category}` : ''} across ${list.length} entr${list.length === 1 ? 'y' : 'ies'}.`;
  }

  // spending (with or without a category)
  if (/spen|spent|cost|paid|pay|expense|blow|blew/.test(q) || category) {
    const list = category ? expenses.filter((t) => t.category === category) : expenses;
    if (!list.length) return `You haven't spent anything${category ? ` on ${category}` : ''} ${period.label}.`;
    const share = sum(expenses) ? (sum(list) / sum(expenses)) * 100 : 0;
    return `You spent ${money(sum(list))}${category ? ` on ${category}` : ''} ${period.label}` +
      (category ? `, which is ${pct(share)} of your total spending.` : ` across ${list.length} transaction${list.length > 1 ? 's' : ''}.`);
  }

  return `I'm not sure I got that. Try: "What's my balance?", "How much did I spend on food last month?", "Where does most of my money go?", "Am I on budget?" or "Summarize my spending".`;
}
