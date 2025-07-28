import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config.tsx';

export interface WorldState {
  cycleNum: number;
  cycleMin: number;
}

export interface QuestType {
  id: number;
  key: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'monthly';
  reward_xp?: number;
  reward_gold?: number;
}

export interface CatchFish {
  species: string;
  rarity: string;
  sellLimit: number;
  sellAmount: number;
}

interface TimeContentData {
  quests: QuestType[];
  weather: string;
  catchOfTheDay: CatchFish[];
  worldState?: WorldState;
}

interface TimeContentProviderProps {
  render: (props: {
    weather: string;
    catchOfTheDay: CatchFish[];
    quests: QuestType[];
    worldState?: WorldState;
    refresh: () => void;
    loading: boolean;
    error: string;
  }) => React.ReactNode;
}

export function TimeContentProvider({ render }: TimeContentProviderProps) {
  const [data, setData] = useState<TimeContentData | null>(null);
  const [cycleStartTimestamp, setCycleStartTimestamp] = useState<number | null>(null);
  const [cycleState, setCycleState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const fetchTimeContent = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await fetch(`${API_BASE}/timecontent`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    const json = await res.json();
    setData(json);

    if (json.cycleStartTimestamp) {
  setCycleStartTimestamp(json.cycleStartTimestamp);
  setCycleState(json.worldState);
} else {
  setCycleStartTimestamp(null);
  setCycleState(null);
}
  } catch (e: any) {
    setError(e.message || 'Failed to load data');
    setData(null);
    setCycleStartTimestamp(null);
    setCycleState(null);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchTimeContent();
  }, []);

  useEffect(() => {
    if (cycleStartTimestamp === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMin = (now - cycleStartTimestamp) / 60000;

      setCycleState(prev => {
        if (!prev) return null;

        let newCycleNum = prev.cycleNum;
        let newCycleMin = diffMin;

        if (newCycleMin >= 150) {
          const passed = Math.floor(newCycleMin / 150);
          newCycleNum += passed;
          newCycleMin %= 150;
        }

        return { cycleNum: newCycleNum, cycleMin: newCycleMin };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleStartTimestamp]);

  if (!data) return loading ? <p className="text-black">Loading...</p> : null;

  return (
    <>
      {render({
        weather: data.weather,
        catchOfTheDay: data.catchOfTheDay,
        quests: data.quests,
        worldState: cycleState ?? data.worldState,
        refresh: fetchTimeContent,
        loading,
        error,
      })}
    </>
  );
}