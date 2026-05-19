import { useUser as useClerkUser } from '@clerk/clerk-react';

export function useUser() {
  const { user, isLoaded } = useClerkUser();
  return {
    user,
    isLoaded,
    role: user?.publicMetadata?.role || 'employee'
  };
}
