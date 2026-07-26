import { useState, useCallback } from 'react';
import {
  doc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

function moisCourant(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

interface ExportQuotaState {
  remaining: number;
  total: number;
  loading: boolean;
}

export function useExportQuota() {
  const { user } = useAuth();
  const db = getFirebaseFirestore();
  const [state, setState] = useState<ExportQuotaState>({
    remaining: 3,
    total: 3,
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ remaining: 0, total: 0, loading: false });
      return;
    }

    try {
      const subDoc = await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'users', user.uid, 'subscription', 'main');
        return transaction.get(ref);
      });

      if (subDoc.exists() && subDoc.data().plan === 'unlimited') {
        setState({ remaining: Infinity, total: Infinity, loading: false });
        return;
      }

      const month = moisCourant();
      const exportDoc = await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'users', user.uid, 'exports', month);
        return transaction.get(ref);
      });

      const count = exportDoc.exists() ? exportDoc.data().count : 0;
      setState({
        remaining: Math.max(0, 3 - count),
        total: 3,
        loading: false,
      });
    } catch {
      setState({ remaining: 0, total: 3, loading: false });
    }
  }, [user, db]);

  const canExport = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const subDoc = await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'users', user.uid, 'subscription', 'main');
        return transaction.get(ref);
      });

      if (subDoc.exists() && subDoc.data().plan === 'unlimited') {
        return true;
      }

      const month = moisCourant();
      const exportDoc = await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'users', user.uid, 'exports', month);
        return transaction.get(ref);
      });

      const count = exportDoc.exists() ? exportDoc.data().count : 0;
      return count < 3;
    } catch {
      return false;
    }
  }, [user, db]);

  const incrementExport = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const month = moisCourant();
    const ref = doc(db, 'users', user.uid, 'exports', month);

    try {
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(ref);
        if (existing.exists()) {
          const current = existing.data().count;
          if (current >= 3) {
            throw new Error('Quota dépassé');
          }
          transaction.update(ref, {
            count: current + 1,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.set(ref, {
            month,
            count: 1,
            updatedAt: new Date().toISOString(),
          });
        }
      });
      await refresh();
      return true;
    } catch (err) {
      console.error('Erreur incrément export:', err);
      return false;
    }
  }, [user, db, refresh]);

  return {
    ...state,
    canExport,
    incrementExport,
    refresh,
  };
}