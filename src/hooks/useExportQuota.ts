import { useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

function moisCourant(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const QUOTA_MAX = 3;

interface ExportQuotaState {
  remaining: number;
  total: number;
  loading: boolean;
}

export function useExportQuota() {
  const { user } = useAuth();
  const db = getFirebaseFirestore();
  const [state, setState] = useState<ExportQuotaState>({
    remaining: QUOTA_MAX,
    total: QUOTA_MAX,
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ remaining: 0, total: 0, loading: false });
      return;
    }

    try {
      const subRef = doc(db, 'users', user.uid, 'subscription', 'main');
      const subSnap = await getDoc(subRef);

      if (subSnap.exists() && subSnap.data().plan === 'unlimited') {
        setState({ remaining: Infinity, total: Infinity, loading: false });
        return;
      }

      const month = moisCourant();
      const exportRef = doc(db, 'users', user.uid, 'exports', month);
      const exportSnap = await getDoc(exportRef);

      const count = exportSnap.exists() ? exportSnap.data().count : 0;
      setState({
        remaining: Math.max(0, QUOTA_MAX - count),
        total: QUOTA_MAX,
        loading: false,
      });
    } catch {
      setState({ remaining: 0, total: QUOTA_MAX, loading: false });
    }
  }, [user, db]);

  const tryIncrementExport = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const subRef = doc(db, 'users', user.uid, 'subscription', 'main');
      const subSnap = await getDoc(subRef);

      if (subSnap.exists() && subSnap.data().plan === 'unlimited') {
        return true;
      }

      const month = moisCourant();
      const ref = doc(db, 'users', user.uid, 'exports', month);

      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(ref);
        if (existing.exists()) {
          const current = existing.data().count;
          if (current >= QUOTA_MAX) {
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
    } catch {
      return false;
    }
  }, [user, db, refresh]);

  return {
    ...state,
    tryIncrementExport,
    refresh,
  };
}
