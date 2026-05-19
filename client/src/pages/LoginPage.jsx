import { Navigate } from 'react-router-dom';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { Logo } from '../components/Logo';

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-40 animate-pulse rounded bg-slate-300" /></div>;
  }

  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo className="h-20 w-auto" />
      <SignIn forceRedirectUrl="/dashboard" signUpUrl="/register" />
    </div>
  );
}
