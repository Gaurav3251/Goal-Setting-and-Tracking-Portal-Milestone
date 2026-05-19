import { useNavigate } from 'react-router-dom';

export function Logo({ className = 'h-10 w-auto' }) {
  const navigate = useNavigate();
  return (
    <img
      src="/logo.png"
      alt="Milestone"
      className={className}
      onClick={() => navigate('/')}
      style={{ cursor: 'pointer' }}
    />
  );
}
