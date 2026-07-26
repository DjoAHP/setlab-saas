import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getFirebaseFirestore } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface SubscriptionState {
  plan: 'free' | 'unlimited';
  loading: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const db = getFirebaseFirestore();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ plan: 'free', loading: false });
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'users', user.uid, 'subscription', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setState({
            plan: data.plan || 'free',
            loading: false,
          });
        } else {
          setState({ plan: 'free', loading: false });
        }
      },
      () => {
        setState({ plan: 'free', loading: false });
      }
    );

    return unsub;
  }, [user, db]);

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ plan: 'free', loading: false });
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', user.uid, 'subscription', 'main'));
      if (snap.exists()) {
        setState({
          plan: snap.data().plan || 'free',
          loading: false,
        });
      } else {
        setState({ plan: 'free', loading: false });
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user, db]);

  const subscribe = useCallback(async () => {
    if (!user) return;

    try {
      const functions = getFunctions(getApp(), 'europe-west1');
      const createCheckout = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckout();
      const data = result.data as { url: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erreur subscribe:', err);
    }
  }, [user]);

  const manageBilling = useCallback(async () => {
    if (!user) return;

    try {
      const functions = getFunctions(getApp(), 'europe-west1');
      const createPortal = httpsCallable(functions, 'createPortalSession');
      const result = await createPortal();
      const data = result.data as { url: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erreur manageBilling:', err);
    }
  }, [user]);

  return {
    ...state,
    subscribe,
    manageBilling,
    refresh,
  };
}