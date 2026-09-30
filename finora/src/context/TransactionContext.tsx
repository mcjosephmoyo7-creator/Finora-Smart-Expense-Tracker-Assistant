import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Transaction } from '../types';

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<string>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue>({
  transactions: [],
  loading: true,
  error: null,
  addTransaction: async () => '',
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
});

export function useTransactions() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate?.() || new Date(doc.data().date),
        }));
        setTransactions(txs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Transaction listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addTransaction = async (data) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateTransaction = async (id, data) => {
    if (!user) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTransaction = async (id) => {
    if (!user) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, loading, error, addTransaction, updateTransaction, deleteTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
