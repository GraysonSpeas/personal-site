import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config.tsx';
import { TimeWeather } from '../fishinglogic/TimeWeather.tsx';
import { DailyCatch } from '../fishinglogic/DailyCatch.tsx';
import { Quest } from '../fishinglogic/Quest.tsx';

interface WorldState {
  cycleNum: number;
  cycleMin: number;
}

interface QuestType {
  key: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

interface CatchFish {
  species: string;
  rarity: string;
  sellLimit: number;
}

interface TimeContent {
  quests: QuestType[];
  weather: string;
  catchOfTheDay: CatchFish[];
  worldState?: WorldState;
}

export function TimeContentUI() {
  const [data, setData] = useState<TimeContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cycleStartTimestamp, setCycleStartTimestamp] = useState<number | null>(null);
  const [cycleState, setCycleState] = useState<{ cycleNum: number; cycleMin: number } | null>(
    null
  );

  const fetchTimeContent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/timecontent`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const json = await res.json();
      setData(json);

      if (json.worldState) {
        setCycleStartTimestamp(Date.now() - json.worldState.cycleMin * 60000);
        setCycleState({ cycleNum: json.worldState.cycleNum, cycleMin: json.worldState.cycleMin });
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
      const diffMs = now - cycleStartTimestamp;
      let newCycleMin = diffMs / 60000;

      setCycleState((prev) => {
        if (!prev) return null;
        let newCycleNum = prev.cycleNum;

        if (newCycleMin >= 150) {
          const cyclesPassed = Math.floor(newCycleMin / 150);
          newCycleNum += cyclesPassed;
          newCycleMin = newCycleMin % 150;
        }

        return { cycleNum: newCycleNum, cycleMin: newCycleMin };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleStartTimestamp]);

  if (!data) {
    return (
      <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg text-black">
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <TimeWeather weather={data.weather} worldState={cycleState ?? undefined} />
      <DailyCatch catchOfTheDay={data.catchOfTheDay} />
      <Quest quests={data.quests} />

      <button
        onClick={fetchTimeContent}
        disabled={loading}
        className={`mt-6 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}
