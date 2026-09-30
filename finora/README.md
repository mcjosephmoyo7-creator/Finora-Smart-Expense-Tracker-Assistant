# Finora — Smart Expense Tracker Assistant

> **React Native Final Project**  
> **Author:** Mc Joseph Moyo  
> **Backend:** Firebase Authentication & Cloud Firestore (Project ID: `finora-smart-expense-tracker`)

---

## 📱 Project Overview
**Finora** is a smart, cloud-connected mobile personal finance app built with **React Native (Expo)**, **TypeScript**, and **Firebase**. It allows users to track their income and expenses, monitor monthly and category budgets with automatic alert tiers, explore interactive visual spending insights, and chat with a built-in **Rule-Based Smart Financial Assistant** that delivers real-time calculations directly from their stored transactions.

---

## 🚀 Key Features

### 1. 🔐 Authentication & Persistent Session
- Email & password sign-up, sign-in, and password reset via Firebase Auth.
- Session persistence across restarts via `@react-native-async-storage/async-storage`.
- In-depth input validation with inline friendly error messages for invalid credentials, weak passwords, and duplicate emails.

### 2. 💸 Real-time Money Tracking
- Add, edit, and delete transactions in real time with Firestore listeners (`onSnapshot`).
- 10 Expense Categories: *Groceries, Dining Out, Transport, Housing, Utilities, Health, Shopping, Entertainment, Education, Other*.
- 4 Income Categories: *Salary, Freelance, Gift, Other Income*.
- SectionList grouped by date (`Today`, `Yesterday`, and formatted dates).
- Multi-filter search (by title, notes, income/expense type, categories, and periods).

### 3. 🎯 Smart Budgeting
- Overall monthly budget limit with real-time percentage tracking.
- Three visual alert tiers:
  - 🟢 **On Track** (< 75%)
  - 🟡 **Approaching Limit** (75% – 99%)
  - 🔴 **Over Budget** (≥ 100%)
- **Daily safe-to-spend** calculation: remaining budget divided by remaining days in the month.
- Per-category spending caps with interactive progress bars and alert highlights.

### 4. 📊 Financial Insights & Analytics
- Stat cards: Total income, total expenses, net savings, transaction count, average daily spend.
- Highlights: Biggest single expense and highest spending category.
- Donut chart with legend showing amounts and percentages (`react-native-gifted-charts`).
- Month-over-month comparison (% up or down).

### 5. 🤖 Built-In Smart Assistant (Deterministic Rule-Based NLP)
- Answers questions in plain English directly from live Firestore transaction data without paid external AI APIs.
- Quick suggestion chips:
  - *"What's my balance?"*
  - *"How much have I spent on groceries this month?"*
  - *"Am I on budget?"*
  - *"Where does most of my money go?"*
  - *"How much did I earn last month?"*
  - *"Summarize my spending"*
- Interactive typing indicator and suggestion fallback.

### 6. ⚙️ Account & Settings
- Change display name and default currency symbol (`$`, `€`, `£`, `¥`, `₹`, `₦`, `R`, etc.).
- Update password securely with Firebase re-authentication.
- Sign out with confirmation.

---

## 🛠️ Tech Stack
- **Framework:** Expo SDK 57 / React Native 0.86
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **Backend:** Firebase Authentication & Cloud Firestore (JS SDK v12)
- **State Management:** React Context API (`AuthContext`, `TransactionContext`)
- **Charts:** `react-native-gifted-charts` & `react-native-svg`
- **Icons & Typography:** `@expo/vector-icons` (MaterialIcons) & Google Fonts (*Plus Jakarta Sans*)

---

## 📁 Project Structure

```
finora/
├── src/
│   ├── components/
│   │   ├── AppButton.tsx
│   │   ├── AppInput.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── BudgetProgressBar.tsx
│   │   ├── CategoryChip.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FilterChip.tsx
│   │   ├── FinoraLogo.tsx
│   │   ├── ScreenHeader.tsx
│   │   ├── StatCard.tsx
│   │   └── TransactionRow.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── TransactionContext.tsx
│   ├── hooks/
│   │   ├── useBudgetStatus.ts
│   │   ├── useMonthStats.ts
│   │   └── useTransactions.ts
│   ├── navigation/
│   │   ├── AppTabs.tsx
│   │   ├── AuthStack.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── ActivityScreen.tsx
│   │   ├── AddEditTransactionScreen.tsx
│   │   ├── AssistantScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── InsightsScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   └── TransactionDetailsScreen.tsx
│   ├── utils/
│   │   ├── assistantEngine.ts
│   │   ├── calculations.ts
│   │   ├── categories.ts
│   │   ├── dateHelpers.ts
│   │   └── theme.ts
│   ├── firebase.ts
│   └── types.ts
├── firestore.rules
├── App.js
├── app.json
├── package.json
└── tsconfig.json
```

---

## ⚙️ How to Run the App

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

3. **Previewing:**
   - Scan the QR code using the **Expo Go** app on iOS or Android.
   - Or press `a` for Android emulator, `i` for iOS simulator, or `w` for Web.

---

## 🔒 Firestore Security Rules
Make sure to publish the following security rules in your [Firebase Console](https://console.firebase.google.com/project/finora-smart-expense-tracker/firestore/rules):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
