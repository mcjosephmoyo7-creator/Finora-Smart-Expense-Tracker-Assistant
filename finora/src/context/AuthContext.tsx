import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
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
  // DEV MODE: Skip authentication and go straight to home screen.
  const [user] = useState<User | null>({ uid: 'dev-user', displayName: 'Dev User', email: 'dev@finora.app' } as User);
  const [profile] = useState<Profile | null>({
    name: 'Dev User',
    email: 'dev@finora.app',
    currency: '$',
    monthlyBudget: 0,
    categoryLimits: {},
    createdAt: null,
  });
  const [loading] = useState(false);

  const updateProfile = async (updates: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
