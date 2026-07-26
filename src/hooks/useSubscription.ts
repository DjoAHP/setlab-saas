import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../firebase/config';
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
      const functionsUrl = 'https://europe-west1-setlab-saas.cloudfunctions.net/createCheckoutSession';
      const token = await getFirebaseAuth().currentUser?.getIdToken();

      const response = await fetch(functionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.result?.url) {
        window.location.href = data.result.url;
      } else {
        console.error('Erreur création session:', data);
      }
    } catch (err) {
      console.error('Erreur subscribe:', err);
    }
  }, [user]);

  const manageBilling = useCallback(async () => {
    if (!user) return;

    try {
      const functionsUrl = 'https://europe-west1-setlab-saas.cloudfunctions.net/createPortalSession';
      const token = await getFirebaseAuth().currentUser?.getIdToken();

      const response = await fetch(functionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.result?.url) {
        window.location.href = data.result.url;
      } else {
        console.error('Erreur création portal:', data);
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