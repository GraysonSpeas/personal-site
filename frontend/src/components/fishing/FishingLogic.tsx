import { useState } from 'react';
import { API_BASE } from '../../config.tsx';
import { useAuth } from '../auth/AuthContext';

export function useFishingLogic() {
  const { user, loading: authLoading, refetch } = useAuth();
  const [fishCount, setFishCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fish() {
    if (!user) {
      setError('You must be logged in to fish.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/fishing/fish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to catch fish.');
      }

      const data = await res.json();
      // update count using the returned game state
      setFishCount(data.gameState.caughtFish.length);

      // if fishing affects anything in your user context, refetch
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { fishCount, fish, loading: loading || authLoading, error };
}