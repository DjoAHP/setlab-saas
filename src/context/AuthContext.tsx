import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { MigrationModal } from '../components/migration/MigrationModal';

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
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    authService.init().then(() => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    });

    authService.onUserChange((u) => {
      setUser(u);
      if (u) {
        syncService.init(u.uid);
        setTimeout(() => setShowMigration(true), 500);
      } else {
        syncService.destroy();
        setShowMigration(false);
      }
    });

    return () => {
      authService.offUserChange(() => {});
    };
  }, []);

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
      {showMigration && user && (
        <MigrationModal
          userId={user.uid}
          onComplete={() => setShowMigration(false)}
        />
      )}
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