import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export default function Dashboard() {
  const { role, isLoaded } = useUser();
  if (!isLoaded) return <div className="animate-pulse p-6">Loading dashboard...</div>;
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}
