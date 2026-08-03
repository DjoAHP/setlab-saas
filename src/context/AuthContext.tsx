import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { getFirebaseFirestore } from '../firebase/config';


interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    authService.init().then(() => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    });

    const onUserChanged = async (u: User | null) => {
      setUser(u);
      if (u) {
        syncService.init(u.uid);
      } else {
        syncService.destroy();
      }
    };
    authService.onUserChange(onUserChanged);

    return () => {
      authService.offUserChange(onUserChanged);
    };
  }, []);

  // Initialiser le document subscription à la connexion
  useEffect(() => {
    if (!user) return;
    const db = getFirebaseFirestore();
    const subRef = doc(db, 'users', user.uid, 'subscription', 'main');
    getDoc(subRef).then((snap) => {
      if (!snap.exists()) {
        setDoc(subRef, {
          plan: 'free',
          status: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}