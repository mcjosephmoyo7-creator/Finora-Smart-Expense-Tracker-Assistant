// Finora assistant: rule-based, deterministic NLP engine. All metrics are calculated from the user's live Firestore transactions.

import { Transaction, Profile } from '../types';

const DAY = 86400000;
const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const toDate = (t: Transaction): Date => {
  if (!t.date) return new Date();
  if (t.date instanceof Date) return t.date;
  if (typeof (t.date as any).toDate === 'function') return (t.date as any).toDate();
  const d = new Date(t.date);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Natural language vocabulary mapped to exact category names
const CATEGORY_WORDS: Record<string, string[]> = {
  Groceries: ['grocery', 'groceries', 'supermarket', 'food shopping', 'market'],
  'Dining Out': ['dining out', 'dining', 'restaurant', 'eating out', 'takeaway', 'takeout', 'coffee', 'cafe', 'lunch', 'dinner', 'fast food', 'food'],
  Transport: ['transport', 'bus', 'taxi', 'uber', 'bolt', 'fuel', 'petrol', 'gas', 'fare', 'commute', 'train', 'flight'],
  Housing: ['housing', 'rent', 'mortgage', 'house', 'apartment', 'flat'],
  Utilities: ['utilities', 'utility', 'electricity', 'water', 'wifi', 'internet', 'airtime', 'power', 'bills', 'bill'],
  Health: ['health', 'medical', 'doctor', 'hospital', 'pharmacy', 'medicine', 'clinic', 'dentist', 'fitness'],
  Shopping: ['shopping', 'clothes', 'clothing', 'shoes', 'amazon', 'gear', 'electronics'],
  Entertainment: ['entertainment', 'movies', 'movie', 'cinema', 'games', 'gaming', 'netflix', 'spotify', 'fun', 'music', 'party'],
  Education: ['education', 'school', 'fees', 'tuition', 'books', 'course', 'college', 'university'],
  Other: ['other', 'misc', 'miscellaneous'],
  Salary: ['salary', 'wage', 'paycheck', 'pay', 'monthly pay'],
  Freelance: ['freelance', 'gig', 'side job', 'side hustle', 'consulting', 'contract'],
  Gift: ['gift', 'gifts', 'present', 'donation', 'bonus'],
  'Other Income': ['other income', 'interest', 'dividends', 'investments', 'refund'],
};

export const SUGGESTIONS = [
  "What's my balance?",
  'How much have I spent on groceries this month?',
  'Where does most of my money go?',
  'Am I on budget?',
  'How much did I earn last month?',
  'Summarize my spending',
];

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
  if (/last month|previous month/.test(q)) {
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return {
      label: 'last month',
      start: new Date(lastMonthYear, lastMonthIdx, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }
  if (/this week|past week|last 7 days|\bweek\b/.test(q)) {
    const back = (today.getDay() + 6) % 7; // Monday start
    return { label: 'this week', start: new Date(+today - back * DAY), end: new Date(+today + DAY) };
  }
  if (/all time|ever|overall|in total|altogether/.test(q)) {
    return { label: 'all time', start: new Date(0), end: new Date(8.64e15) };
  }
  return {
    label: 'this month',
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    isDefault: true,
  };
}

function detectCategory(q: string): string | null {
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (words.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(q))) return cat;
  }
  return null;
}

const sum = (list: Transaction[]): number => list.reduce((s, t) => s + t.amount, 0);
const inRange = (list: Transaction[], p: Period): Transaction[] =>
  list.filter((t) => {
    const d = toDate(t);
    return d >= p.start && d < p.end;
  });

function byCategory(expenses: Transaction[]): { category: string; total: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function getReply(
  question: string,
  transactions: Transaction[] = [],
  profile?: Profile | null,
  now: Date = new Date()
): string {
  const q = question.toLowerCase().trim();
  const cur = profile?.currency || '$';
  const money = (n: number): string =>
    `${cur}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (n: number): string => `${Math.round(n)}%`;

  if (transactions.length === 0 && !/\b(hi|hello|hey|help|thanks|thank)\b/.test(q)) {
    return "You haven't logged any transactions yet. Tap the '+' button on the home screen to add your first transaction, then ask me again!";
  }

  const period = detectPeriod(q, now);
  const category = detectCategory(q);
  const inPeriod = inRange(transactions, period);
  const expenses = inPeriod.filter((t) => t.type === 'expense');
  const income = inPeriod.filter((t) => t.type === 'income');
  const allIncome = sum(transactions.filter((t) => t.type === 'income'));
  const allExpense = sum(transactions.filter((t) => t.type === 'expense'));

  // 1. Greetings and small talk
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
    const firstName = (profile?.name || '').split(' ')[0] || 'there';
    return `Hi ${firstName}! I'm Finora. Ask me about your balance, this month's budget, category expenses, or try one of the suggestion chips below.`;
  }
  if (/\b(thanks|thank you|cheers|awesome|great)\b/.test(q)) {
    return "You're welcome! Let me know if you need any other financial breakdowns.";
  }
  if (/\b(help|what can you do|features)\b/.test(q)) {
    return 'I can analyze your balances, income, category spending, budget status, daily safe-to-spend numbers, and month-over-month comparisons. Try asking: "What\'s my balance?" or "Am I on budget?"';
  }

  // 2. Balance ("What's my balance?")
  if (/\b(balance|how much (money )?do i have|net worth|what do i have|current balance)\b/.test(q)) {
    const netBalance = allIncome - allExpense;
    return `Your total balance is ${netBalance < 0 ? '-' : ''}${money(netBalance)}. You have earned ${money(allIncome)} and spent ${money(allExpense)} across all time.`;
  }

  // 3. Budget & Safe-to-spend ("Am I on budget?", "Can I afford?")
  if (/\b(budget|on budget|safe to spend|afford|overspend|left to spend|spending limit)\b/.test(q)) {
    const limit = profile?.monthlyBudget || 0;
    if (!limit) {
      return "You haven't set a monthly budget yet! Head over to the Budgets tab to set a limit, and I'll keep track of your daily safe-to-spend.";
    }
    const thisMonthPeriod = detectPeriod('this month', now);
    const spentThisMonth = sum(inRange(transactions, thisMonthPeriod).filter((t) => t.type === 'expense'));
    const percent = Math.round((spentThisMonth / limit) * 100);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, lastDayOfMonth - now.getDate() + 1);
    const remaining = limit - spentThisMonth;
    const level =
      percent >= 100 ? 'over budget' : percent >= 75 ? 'getting close to your limit' : 'comfortably on track';

    let reply = `You've spent ${money(spentThisMonth)} of your ${money(limit)} monthly budget (${pct(percent)}), so you're ${level}.`;
    if (remaining > 0) {
      const dailySafe = remaining / daysLeft;
      reply += ` You have ${money(remaining)} remaining, which allows about ${money(dailySafe)} per day for the next ${daysLeft} days.`;
    } else {
      reply += ` You are currently ${money(Math.abs(remaining))} over your budget limit.`;
    }

    // Check category limits
    const limits = profile?.categoryLimits || {};
    const overCategories = Object.entries(limits)
      .filter(([cat, catLimit]) => {
        const catSpent = sum(
          inRange(transactions, thisMonthPeriod).filter(
            (t) => t.type === 'expense' && (t.category === cat || t.category.toLowerCase() === cat.toLowerCase())
          )
        );
        return catSpent >= catLimit;
      })
      .map(([c]) => c);

    if (overCategories.length > 0) {
      reply += ` Note: ${overCategories.join(', ')} exceeded its category limit.`;
    }
    return reply;
  }

  // 4. Summarize spending ("Summarize my spending", "Overview", "Report")
  if (/\b(summar|overview|report|breakdown|recap)\b/.test(q)) {
    const totalInc = sum(income);
    const totalExp = sum(expenses);
    const net = totalInc - totalExp;
    const topThree = byCategory(expenses).slice(0, 3);

    let reply = `Financial summary for ${period.label}: Total income: ${money(totalInc)}, Total expenses: ${money(totalExp)}, Net savings: ${net >= 0 ? '+' : '-'}${money(net)}.`;
    if (topThree.length > 0) {
      const topList = topThree.map((c) => `${c.category} (${money(c.total)})`).join(', ');
      reply += ` Your top spending categories: ${topList}.`;
    }
    return reply;
  }

  // 5. Where does most of my money go / Top category
  if (
    (/\b(where|top|most|highest|biggest)\b/.test(q) && /\b(money|spend|spending|category|expense)\b/.test(q)) ||
    /\b(where does most of my money go)\b/.test(q)
  ) {
    const groups = byCategory(expenses);
    if (!groups.length) {
      return `You have no recorded expenses for ${period.label}.`;
    }
    const totalExp = sum(expenses);
    const top = groups[0];
    const share = totalExp > 0 ? (top.total / totalExp) * 100 : 0;
    let reply = `Most of your money ${period.label} went to ${top.category}: ${money(top.total)}, representing ${pct(share)} of your total spending.`;
    if (groups[1]) {
      reply += ` Followed by ${groups[1].category} at ${money(groups[1].total)}.`;
    }
    return reply;
  }

  // 6. Biggest single expense
  if (/\b(biggest|largest|single|most expensive|highest)\b/.test(q) && /\b(item|purchase|expense|transaction)\b/.test(q)) {
    if (!expenses.length) return `No expenses recorded for ${period.label}.`;
    const biggest = expenses.reduce((max, t) => (t.amount > max.amount ? t : max));
    return `Your biggest single expense ${period.label} was "${biggest.title}" for ${money(biggest.amount)} in ${biggest.category}.`;
  }

  // 7. Month comparison ("Comparison", "vs last month")
  if (/\b(compar|versus|\bvs\b|than last month)\b/.test(q)) {
    const thisMonthPeriod = detectPeriod('this month', now);
    const lastMonthPeriod = detectPeriod('last month', now);
    const thisM = sum(inRange(transactions, thisMonthPeriod).filter((t) => t.type === 'expense'));
    const lastM = sum(inRange(transactions, lastMonthPeriod).filter((t) => t.type === 'expense'));

    if (lastM === 0) {
      return `You've spent ${money(thisM)} this month, and there's no spending recorded for last month to compare against.`;
    }
    const diff = ((thisM - lastM) / lastM) * 100;
    return `This month's expenses are ${money(thisM)} compared to ${money(lastM)} last month (${pct(Math.abs(diff))} ${diff >= 0 ? 'higher' : 'lower'}).`;
  }

  // 8. Income / Earnings ("How much did I earn last month?", "Salary")
  if (/\b(earn|earned|earning|income|salary|made|received|got paid)\b/.test(q) && !/\b(spent|spend)\b/.test(q)) {
    const targetIncome = category ? income.filter((t) => t.category === category || t.category.toLowerCase() === category.toLowerCase()) : income;
    const totalEarned = sum(targetIncome);
    return `You earned ${money(totalEarned)} ${period.label}${category ? ` from ${category}` : ''} across ${targetIncome.length} entr${targetIncome.length === 1 ? 'y' : 'ies'}.`;
  }

  // 9. Specific category spending or general spending ("How much have I spent on groceries this month?")
  if (/\b(spend|spent|cost|costs|paid|expenses|groceries|dining|food|transport|shopping|bills)\b/.test(q) || category) {
    const targetExpenses = category
      ? expenses.filter((t) => t.category === category || t.category.toLowerCase() === category.toLowerCase())
      : expenses;
    const totalSpent = sum(targetExpenses);
    const allPeriodSpent = sum(expenses);
    if (!targetExpenses.length) {
      return `You haven't logged any expenses${category ? ` for ${category}` : ''} ${period.label}.`;
    }
    const share = allPeriodSpent > 0 ? (totalSpent / allPeriodSpent) * 100 : 0;
    return `You have spent ${money(totalSpent)}${category ? ` on ${category}` : ''} ${period.label}${category ? ` (${pct(share)} of your total spending)` : ''} across ${targetExpenses.length} transaction${targetExpenses.length > 1 ? 's' : ''}.`;
  }

  // 10. Fallback with helpful recommendations
  return `I'm not sure I understood that question. You can ask me things like:\n• "What's my balance?"\n• "How much have I spent on groceries this month?"\n• "Am I on budget?"\n• "Where does most of my money go?"\n• "How much did I earn last month?"\n• "Summarize my spending"`;
}
