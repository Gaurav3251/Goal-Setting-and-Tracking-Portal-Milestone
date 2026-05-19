import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from './api';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyGoals from './pages/employee/MyGoals';
import CreateGoal from './pages/employee/CreateGoal';
import EditGoal from './pages/employee/EditGoal';
import QuarterlyUpdate from './pages/employee/QuarterlyUpdate';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamGoals from './pages/manager/TeamGoals';
import ApproveGoals from './pages/manager/ApproveGoals';
import CheckIn from './pages/manager/CheckIn';
import TeamProgress from './pages/manager/TeamProgress';
import AdminDashboard from './pages/admin/AdminDashboard';
import CycleManagement from './pages/admin/CycleManagement';
import UserManagement from './pages/admin/UserManagement';
import SharedGoals from './pages/admin/SharedGoals';
import AuditLogs from './pages/admin/AuditLogs';
import CompletionDashboard from './pages/admin/CompletionDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

function Wrapped({ role, children }) {
  return <ErrorBoundary><AppShell role={role}>{children}</AppShell></ErrorBoundary>;
}

export default function App() {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    window.__clerk_token_getter = async () => getToken();
    return () => { delete window.__clerk_token_getter; };
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    api.post('/api/users/self-sync', {
      full_name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'New User',
      email: user.primaryEmailAddress?.emailAddress,
      role: user.publicMetadata?.role || 'employee'
    }).catch(() => {});
  }, [isLoaded, isSignedIn, user]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/employee/dashboard" element={<ProtectedRoute roles={['employee']}><Wrapped role="employee"><EmployeeDashboard /></Wrapped></ProtectedRoute>} />
        <Route path="/employee/goals" element={<ProtectedRoute roles={['employee']}><Wrapped role="employee"><MyGoals /></Wrapped></ProtectedRoute>} />
        <Route path="/employee/goals/create" element={<ProtectedRoute roles={['employee']}><Wrapped role="employee"><CreateGoal /></Wrapped></ProtectedRoute>} />
        <Route path="/employee/goals/:id/edit" element={<ProtectedRoute roles={['employee']}><Wrapped role="employee"><EditGoal /></Wrapped></ProtectedRoute>} />
        <Route path="/employee/goals/:id/checkin" element={<ProtectedRoute roles={['employee']}><Wrapped role="employee"><QuarterlyUpdate /></Wrapped></ProtectedRoute>} />

        <Route path="/manager/dashboard" element={<ProtectedRoute roles={['manager']}><Wrapped role="manager"><ManagerDashboard /></Wrapped></ProtectedRoute>} />
        <Route path="/manager/team-goals" element={<ProtectedRoute roles={['manager']}><Wrapped role="manager"><TeamGoals /></Wrapped></ProtectedRoute>} />
        <Route path="/manager/approve" element={<ProtectedRoute roles={['manager']}><Wrapped role="manager"><ApproveGoals /></Wrapped></ProtectedRoute>} />
        <Route path="/manager/checkin" element={<ProtectedRoute roles={['manager']}><Wrapped role="manager"><CheckIn /></Wrapped></ProtectedRoute>} />
        <Route path="/manager/progress" element={<ProtectedRoute roles={['manager']}><Wrapped role="manager"><TeamProgress /></Wrapped></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><AdminDashboard /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/cycles" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><CycleManagement /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><UserManagement /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/shared-goals" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><SharedGoals /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><AuditLogs /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/completion" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><CompletionDashboard /></Wrapped></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Wrapped role="admin"><AnalyticsDashboard /></Wrapped></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
