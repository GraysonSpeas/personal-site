import { useState, useRef, useCallback, useEffect } from 'react';
import { API_BASE } from '../../../config.tsx';

type Phase = 'idle' | 'casting' | 'bite-ready' | 'in-minigame' | 'success' | 'failed';

interface FishData {
  id?: string;
  name: string;
}

export function useActiveFishing(user: any) {
  const [activePhase, setActivePhase] = useState<Phase>('idle');
  const [stamina, setStamina] = useState(0); // Updated from "tension"
  const [balance, setBalance] = useState(50);
  const [caughtFish, setCaughtFish] = useState<FishData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fishTugDirection, setFishTugDirection] = useState<'left' | 'right'>('left');
  const [fishTugStrength, setFishTugStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  const timers = useRef<{ bite?: ReturnType<typeof setTimeout>; react?: ReturnType<typeof setTimeout>; loop?: ReturnType<typeof setInterval> }>({});
  const keys = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const getPlayerInput = (): 'left' | 'right' | null => {
    if (keys.current.left && !keys.current.right) return 'left';
    if (keys.current.right && !keys.current.left) return 'right';
    return null;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.left = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.current.right = true;
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.current.right = false;
  };

  const clearAll = useCallback(() => {
    Object.values(timers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    timers.current = {};
  }, []);

  const startActive = useCallback(async () => {
    if (!user) {
      setError('Login required');
      return;
    }
    if (loading) return;

    setLoading(true);
    clearAll();
    setError(null);
    setActivePhase('casting');
    setStamina(0);
    setBalance(50);
    setCaughtFish(null);
    setFishTugStrength(0);
    setFishTugDirection('left');

    try {
      const res = await fetch(`${API_BASE}/fishing/active/start`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to start fishing: ${res.statusText}`);

      const data = await res.json();
      const biteIn = data.biteIn ?? 4;
      const fish = data.fish;

      timers.current.bite = setTimeout(() => {
        setActivePhase('bite-ready');
        timers.current.react = setTimeout(() => setActivePhase('failed'), 2500);
      }, biteIn * 1000);

      setCaughtFish(fish);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
      setActivePhase('idle');
    } finally {
      setLoading(false);
    }
  }, [user, clearAll, loading]);

  const reactActive = useCallback(async () => {
    if (activePhase !== 'bite-ready') return;
    if (timers.current.react) clearTimeout(timers.current.react);

    try {
      const res = await fetch(`${API_BASE}/fishing/active/react`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`React failed: ${res.statusText}`);

      const data = await res.json();
      if (!data.success) {
        setActivePhase('failed');
        return;
      }

      setCaughtFish(data.fish);
      setActivePhase('in-minigame');
    } catch {
      setActivePhase('failed');
    }
  }, [activePhase]);

  useEffect(() => {
    if (activePhase !== 'in-minigame') return;

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    timers.current.loop = setInterval(async () => {
      const playerInput = getPlayerInput();

      try {
        const res = await fetch(`${API_BASE}/fishing/active/minigame/update`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stamina,
            balance,
            playerInput,
          }),
        });

        if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);

        const data = await res.json();

        setFishTugDirection(data.tugDirection || 'left');
        setFishTugStrength(data.tugAmount || 0);

        if (data.caught) {
          setActivePhase('success');
          clearAll();
        } else if (data.snapped) {
          setActivePhase('failed');
          clearAll();
        } else {
          setStamina(data.stamina);
          setBalance(data.balance);
        }
      } catch {
        setActivePhase('failed');
        clearAll();
      }
    }, 100);

    return () => clearAll();
  }, [activePhase, stamina, balance, clearAll]);

  useEffect(() => {
    if (activePhase === 'failed') {
      const retryTimeout = setTimeout(() => setActivePhase('idle'), 2000);
      return () => clearTimeout(retryTimeout);
    }
  }, [activePhase]);

  useEffect(() => {
    return () => clearAll();
  }, [clearAll]);

  return {
    activePhase,
    stamina,
    balance,
    fishTugDirection,
    fishTugStrength,
    caughtFish,
    error,
    startActive,
    reactActive,
    loading,
  };
}