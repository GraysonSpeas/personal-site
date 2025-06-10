// src/fishing/FishingLogic.tsx
import { useState, useEffect } from 'react';
import { API_BASE } from '../../config.tsx';
import { useAuth } from '../auth/AuthProvider';

export function useFishingLogic() {
  const { user, loading: authLoading } = useAuth();
  const [fishCount, setFishCount] = useState<number>(0);
  const [lastCatch, setLastCatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing fishing data on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/fishing/fish`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load fishing data');
        const data = await res.json();
        setFishCount(data.gameState.caughtFish.length);
        setLastCatch(data.gameState.lastCatch || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading fishing data');
      }
    })();
  }, [user]);

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

      if (!res.ok) throw new Error('Failed to catch fish.');

      const data = await res.json();
      setFishCount(data.gameState.caughtFish.length);
      setLastCatch(data.gameState.lastCatch);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { fishCount, lastCatch, fish, loading: loading || authLoading, error };
}