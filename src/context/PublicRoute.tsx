import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingScreen } from '../components/auth/LoadingScreen';
import type { ReactNode } from 'react';

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}