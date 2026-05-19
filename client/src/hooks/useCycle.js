import { useEffect, useState } from 'react';
import api from '../api';

export function useCycle() {
  const [cycleState, setCycleState] = useState({ cycle: null, phase: 'NOT_STARTED' });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/cycles/active');
        setCycleState(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return { ...cycleState, loading };
}
