import { NavLink } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';

const navByRole = {
  employee: [
    ['/employee/dashboard', 'Dashboard'],
    ['/employee/goals', 'My Goals'],
    ['/employee/goals/create', 'Create Goal']
  ],
  manager: [
    ['/manager/dashboard', 'Dashboard'],
    ['/manager/team-goals', 'Team Goals'],
    ['/manager/approve', 'Approve Goals'],
    ['/manager/checkin', 'Check-in'],
    ['/manager/progress', 'Team Progress']
  ],
  admin: [
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/cycles', 'Cycles'],
    ['/admin/users', 'Users'],
    ['/admin/shared-goals', 'Shared Goals'],
    ['/admin/audit', 'Audit Logs'],
    ['/admin/completion', 'Completion'],
    ['/admin/analytics', 'Analytics']
  ]
};

export default function AppShell({ role, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`border-r bg-white p-4 ${open ? 'block' : 'hidden'} lg:block`}>
        <Logo className="h-12" />
        <nav className="mt-6 space-y-2">
          {(navByRole[role] || []).map(([to, label]) => (
            <NavLink key={to} to={to} className="block rounded px-3 py-2 hover:bg-brand-50">{label}</NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <header className="flex items-center justify-between border-b bg-white px-4 py-3">
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)}><Menu /></button>
          <span />
          <UserButton />
        </header>
        <section className="p-4">{children}</section>
      </main>
    </div>
  );
}
