import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Logo } from '../components/Logo';

const questions = [
  'Are your team goals still buried in spreadsheets?',
  'Do quarterly reviews feel like a last-minute scramble?',
  'Need one portal for goals, approvals, and check-ins?'
];

const TYPE_MS = 45;
const HOLD_MS = 1200;

export default function LandingPage() {
  const year = new Date().getFullYear();
  const [qIndex, setQIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const currentQuestion = useMemo(() => questions[qIndex], [qIndex]);

  useEffect(() => {
    let i = 0;
    setTyped('');
    const typer = setInterval(() => {
      i += 1;
      setTyped(currentQuestion.slice(0, i));
      if (i >= currentQuestion.length) {
        clearInterval(typer);
        setTimeout(() => {
          if (qIndex < questions.length - 1) {
            setQIndex((p) => p + 1);
          } else {
            setShowSolution(true);
          }
        }, HOLD_MS);
      }
    }, TYPE_MS);

    return () => clearInterval(typer);
  }, [currentQuestion, qIndex]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-brand-50 to-slate-100">
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="py-12 text-center md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-lg backdrop-blur">
            <h2 className="mx-auto mt-1 min-h-[96px] max-w-4xl font-display text-3xl text-slate-900 md:min-h-[120px] md:text-5xl">
              {typed}
              <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-brand-700 align-middle" />
            </h2>

            <div className={`mx-auto mt-10 max-w-4xl transform rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-900 to-brand-600 p-8 text-white shadow-xl transition-all duration-700 ${showSolution ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Milestone</p>
              <h1 className="mt-3 font-display text-4xl md:text-6xl">Goal Setting & Tracking for Growing Organizations</h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-brand-100 md:text-lg">Plan better. Approve faster. Track quarterly progress with clarity your teams can trust.</p>
              <Link to="/login" className="mt-8 inline-block rounded bg-white px-8 py-3 text-lg font-semibold text-brand-900">Enter Your Portal</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-200/70 bg-transparent p-5 text-center text-sm text-muted">Milestone - Set. Track. Achieve. - {year}</footer>
    </div>
  );
}
