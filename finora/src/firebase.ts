import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyD1wAdi4O2kL8PWIGvB7ZROGbVcZ03TJAY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "finora-smart-expense-tracker.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "finora-smart-expense-tracker",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "finora-smart-expense-tracker.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "936462546533",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:936462546533:web:8302424e422bfdc2a3b88c",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XBYS9MGP8J",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persistence keeps the user signed in across app restarts
let auth: Auth;
try {
  // @ts-ignore
  const authModule = require('firebase/auth');
  const getPersistence = authModule.getReactNativePersistence;
  auth = initializeAuth(app, {
    persistence: getPersistence ? getPersistence(AsyncStorage) : undefined,
  });
} catch (e) {
  auth = getAuth(app); // fallback if already initialised (e.g. Fast Refresh)
}

export { auth, app };
export const db = getFirestore(app);

