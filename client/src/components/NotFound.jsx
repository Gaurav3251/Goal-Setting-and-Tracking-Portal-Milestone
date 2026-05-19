import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><h1 className="font-display text-3xl">404</h1><p>Page not found.</p><Link to="/" className="rounded bg-brand-600 px-3 py-2 text-white">Go Home</Link></div>;
}
