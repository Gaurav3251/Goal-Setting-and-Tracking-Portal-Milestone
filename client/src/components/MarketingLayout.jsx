import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

function MarketingNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="flex items-center gap-3" aria-label="Go to landing page">
        <Logo className="h-20 w-auto" />
        <div className="hidden sm:block">
          <div className="font-display text-2xl text-brand-900">Milestone</div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Set. Track. Achieve.</div>
        </div>
      </Link>
      <div className="hidden items-center gap-6 md:flex">
        <Link to="/features" className="text-sm font-medium text-slate-700 hover:text-brand-700">Features</Link>
        <Link to="/about" className="text-sm font-medium text-slate-700 hover:text-brand-700">About</Link>
        <Link to="/pricing" className="text-sm font-medium text-slate-700 hover:text-brand-700">Pricing</Link>
      </div>
      <div className="flex gap-2">
        <Link to="/login" className="rounded border border-slate-300 bg-white px-4 py-2">Login</Link>
        <Link to="/register" className="rounded bg-brand-600 px-4 py-2 text-white">Get Started</Link>
      </div>
    </nav>
  );
}

export default function MarketingLayout({ title, subtitle, children }) {
  const year = new Date().getFullYear();
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-brand-50 to-slate-100">
      <MarketingNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-10">
        <header className="py-8">
          <h1 className="font-display text-5xl text-slate-900">{title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted">{subtitle}</p>
        </header>
        {children}
      </main>
      <footer className="mt-auto border-t border-slate-200/70 bg-transparent p-6 text-center text-sm text-muted">Milestone - Set. Track. Achieve. - {year}</footer>
    </div>
  );
}
