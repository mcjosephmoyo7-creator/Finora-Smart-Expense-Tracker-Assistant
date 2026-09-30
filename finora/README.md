# Finora

A mobile expense tracker: log income and spending, set budgets, see where your money goes, and ask a built-in assistant questions about your own data.

Built with React Native (Expo), Firebase Authentication and Cloud Firestore.

## What it does

- Sign up, sign in, sign out, reset password by email
- Add, edit and delete income and expenses, with categories, dates and notes
- Search and filter your history (type, category, period)
- Monthly budget plus optional category limits, with 3 alert levels
- Insights: totals, biggest expense, top category, donut chart, month comparison
- Assistant that answers questions like "How much did I spend on groceries this month?"
- Data syncs live and stays after you close the app, on any device you sign in on

## What you need to install first

| Tool | Why | Get it |
|------|-----|--------|
| Node.js (LTS) | runs everything | nodejs.org |
| Git | version control | git-scm.com |
| VS Code | editor | code.visualstudio.com |
| Expo Go (on your phone) | preview the app | Play Store / App Store |
| Firebase CLI (optional) | deploy security rules | `npm install -g firebase-tools` |

Useful VS Code extensions: Material Icon Theme (nicer file icons in the editor), ES7+ React/Redux/RN Snippets, Prettier.

The icons inside the app come from `@expo/vector-icons` (Material Icons). That is a normal npm package, already included in the install command below.

## Step 1: Create your Firebase project (about 5 minutes)

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Add project**, name it `finora`, and continue (Analytics is optional).
3. **Add a web app**: on the project home click the `</>` icon, name it `finora-app`, and register. Copy the config values it shows (apiKey, authDomain, and so on).
4. **Turn on login**: Build, then Authentication, then Get started, then Sign-in method, then enable **Email/Password**.
5. **Create the database**: Build, then Firestore Database, then Create database. Choose Production mode and a region close to you.
6. **Publish security rules**: in Firestore, open the Rules tab, paste the contents of `firestore.rules`, and click Publish. Or with the CLI: `firebase login`, then `firebase init firestore`, then `firebase deploy --only firestore:rules`.

You never create the collections by hand. The app creates `users/{uid}` on sign-up and `transactions` on the first entry.

## Step 2: Run the app

```bash
git clone <your-repo-url>
cd finora
npm install
cp .env.example .env      # then fill in your Firebase values
npx expo start
```

Scan the QR code with Expo Go. If the phone can't connect, run `npx expo start --tunnel`.

### .env file

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

`.env` is in `.gitignore`. Never commit it.

## Project structure

```
src/
  components/   reusable UI pieces (AppButton, TransactionRow, ...)
  screens/      one file per screen
  navigation/   auth flow, tabs, root
  context/      AuthContext, TransactionContext
  hooks/        custom hooks
  utils/        categories, calculations, assistantEngine, theme
```

## How the assistant works

`utils/assistantEngine.js` reads your live transactions, works out the period ("last month"), category ("groceries") and intent ("how much did I spend"), then calculates the answer. The numbers always come from your real data, and no paid AI service is required.

## Testing checklist

- [ ] Sign up, close the app, reopen: still signed in
- [ ] Add income and expense: balance updates instantly
- [ ] Budget alerts at 74%, 75%, 99%, 100%
- [ ] Filters and search work together
- [ ] Same data on a second device
- [ ] Rules published (not test mode)
- [ ] No secrets in git

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Icons show as ? boxes | Make sure the MaterialIcons font loads before the app renders (see App.js) |
| "Missing or insufficient permissions" | Rules not published, or you're signed out |
| auth/invalid-credential | Wrong email or password |
| Session lost after restart | firebase.js must use `getReactNativePersistence(AsyncStorage)` |
| Env values are undefined | Restart with `npx expo start -c` after editing .env |

## Author

Mc Joseph Moyo. React Native final project.
