import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useUser } from '../hooks/useUser';

export default function ProtectedRoute({ roles = [], children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { role } = useUser();

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-40 animate-pulse rounded bg-slate-300" /></div>;
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
