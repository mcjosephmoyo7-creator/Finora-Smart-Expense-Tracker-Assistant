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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Transaction } from '../types';

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
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
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txs: Transaction[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const parsedDate =
            data.date?.toDate?.() || (data.date ? new Date(data.date) : new Date());
          return {
            id: docSnap.id,
            title: data.title || '',
            amount: Number(data.amount) || 0,
            type: data.type === 'income' ? 'income' : 'expense',
            category: data.category || 'Other',
            date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
            note: data.note || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
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

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      title: data.title.trim(),
      amount: Math.abs(Number(data.amount)),
      type: data.type,
      category: data.category,
      date: Timestamp.fromDate(data.date instanceof Date ? data.date : new Date(data.date)),
      note: data.note ? data.note.trim() : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) throw new Error('Not authenticated');
    const payload: any = {
      updatedAt: serverTimestamp(),
    };
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.amount !== undefined) payload.amount = Math.abs(Number(data.amount));
    if (data.type !== undefined) payload.type = data.type;
    if (data.category !== undefined) payload.category = data.category;
    if (data.note !== undefined) payload.note = data.note.trim();
    if (data.date !== undefined) {
      payload.date = Timestamp.fromDate(data.date instanceof Date ? data.date : new Date(data.date));
    }
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), payload);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
