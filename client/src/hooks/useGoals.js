import { useEffect, useState } from 'react';
import api from '../api';

export function useGoals(path = '/goals') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api${path}`);
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refetch(); }, [path]);
  return { data, loading, refetch };
}
