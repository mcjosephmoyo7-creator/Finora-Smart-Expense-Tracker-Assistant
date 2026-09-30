import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setProfile({
              name: data.name || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email || '',
              currency: data.currency || '$',
              monthlyBudget: Number(data.monthlyBudget) || 0,
              categoryLimits: data.categoryLimits || {},
              createdAt: data.createdAt,
            });
          } else {
            const newProfile: Profile = {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              currency: '$',
              monthlyBudget: 0,
              categoryLimits: {},
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setProfile(null);
        }
      } else {
        // No signed-in user: skip the login screen and enter the app
        // automatically with an anonymous account.
        setLoading(true);
        signInAnonymously(auth).catch((error) => {
            console.error(
              'Anonymous sign-in failed. Enable Anonymous auth in Firebase Console (Authentication > Sign-in method).',
              error
            );
            setUser(null);
            setProfile(null);
            setLoading(false);
          });
        return;
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
