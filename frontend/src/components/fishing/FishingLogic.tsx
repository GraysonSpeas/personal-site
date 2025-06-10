import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../../config.tsx';
import { useAuth } from '../auth/AuthProvider';

export function useFishingLogic() {
  const { user, loading: authLoading } = useAuth();
  const [fishCount, setFishCount] = useState<number>(0);
  const [lastCatch, setLastCatch] = useState<boolean | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current state from backend
  async function fetchState() {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/fishing/state`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load fishing state');
      const data = await res.json();
      setXp(data.xp);
      setLevel(data.level);
      setGold(data.gold);
      setFishCount(data.fishCount);
      setLastCatch(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading fishing state');
    }
  }

  // Initial load
  useEffect(() => {
    fetchState();
  }, [user]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setTimeout(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [cooldown]);

  // Try to catch fish
  async function fish() {
    if (!user) {
      setError('You must be logged in to fish.');
      return;
    }
    if (cooldown > 0) {
      setError(`You must wait ${cooldown} seconds before fishing again.`);
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

      setXp(data.xp);
      setLevel(data.level);
      setGold(data.gold);
      setFishCount(data.fishCount);
      setLastCatch(data.caught);

      setCooldown(5); // 5 seconds cooldown
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // Sell fish
  async function sellFish() {
    if (!user) {
      setError('You must be logged in to sell fish.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/fishing/sell`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to sell fish.');

      const data = await res.json();

      setGold(data.gold);
      setFishCount(data.remainingFish ?? 0);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return {
    fishCount,
    lastCatch,
    xp,
    level,
    gold,
    cooldown,
    fish,
    sellFish,
    loading: loading || authLoading,
    error,
  };
}