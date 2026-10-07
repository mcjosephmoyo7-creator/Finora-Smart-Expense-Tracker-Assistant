import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Profile } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  updateProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Optional dev bypass: EXPO_PUBLIC_SKIP_AUTH=1 skips sign-in and uses a local
// fake user (no Firestore reads/writes). Leave unset to use real Firebase Auth.
const SKIP_AUTH = process.env.EXPO_PUBLIC_SKIP_AUTH === '1';

const DEV_USER = {
  uid: 'dev-user',
  displayName: 'Dev User',
  email: 'dev@finora.app',
} as User;

function defaultProfileFor(user: User): Profile {
  return {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    currency: '$',
    monthlyBudget: 0,
    categoryLimits: {},
    createdAt: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(SKIP_AUTH ? DEV_USER : null);
  const [profile, setProfile] = useState<Profile | null>(
    SKIP_AUTH ? defaultProfileFor(DEV_USER) : null
  );
  const [loading, setLoading] = useState(!SKIP_AUTH);

  // Firebase sign-in/sign-out listener — this is what routes Auth <-> App
  // in RootNavigator (user null -> Onboarding/SignIn/SignUp, user -> Tabs).
  useEffect(() => {
    if (SKIP_AUTH) return;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setProfile(nextUser ? defaultProfileFor(nextUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Live profile (users/{uid}) so budget/settings changes sync to every screen.
  useEffect(() => {
    if (!user || SKIP_AUTH) return;
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setProfile({ ...defaultProfileFor(user), ...data } as Profile);
        }
      },
      (err) => {
        console.error('Profile listener error:', err);
      }
    );
    return unsubscribe;
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated');
    // Optimistic local update so the UI refreshes instantly
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    if (SKIP_AUTH) return;
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
