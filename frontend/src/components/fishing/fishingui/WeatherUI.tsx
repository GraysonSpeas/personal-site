import React from 'react';

interface WorldState {
  cycleNum: number;
  cycleMin: number;
}

interface WeatherUIProps {
  weather: string;
  worldState?: WorldState;
}

function calcPhase(cycleMin: number): 'day' | 'night' {
  return cycleMin < 120 ? 'day' : 'night';
}

function calcRain(
  cycleNum: number,
  cycleMin: number
): { isRaining: boolean; rainStartMin: number | null } {
  if (cycleNum % 3 === 2) {
    const rainSchedule = [15, 90, 105];
    const rainIndex = Math.floor((cycleNum / 3) % rainSchedule.length);
    const rainStartMin = rainSchedule[rainIndex];
    const rainEndMin = rainStartMin + 45;
    const isRaining = cycleMin >= rainStartMin && cycleMin < rainEndMin;
    return { isRaining, rainStartMin };
  }
  return { isRaining: false, rainStartMin: null };
}

function formatRealTime(): string {
  const now = new Date();
  const cstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const hours = cstNow.getHours();
  const mins = cstNow.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function WeatherUI({ weather, worldState }: WeatherUIProps) {
  if (!worldState) {
    return (
      <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg text-black">
        <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
        <div className="mb-6 p-2 bg-blue-200 rounded text-center font-medium">{weather}</div>
        <p>No world state data available</p>
      </div>
    );
  }

  const { cycleNum, cycleMin } = worldState;
  const phase = calcPhase(cycleMin);

  const { isRaining, rainStartMin } = calcRain(cycleNum, cycleMin);
  const rainDuration = 45;

  const rainInfo = (() => {
    const rainCycle = cycleNum % 3 === 2;

    if (!rainCycle || rainStartMin === null) {
      const cyclesUntilRain = (3 - (cycleNum % 3)) % 3 || 3;
      const minutesUntilNextCycle = (150 - cycleMin) + 150 * (cyclesUntilRain - 1);
      return `Next rain expected in ~${Math.ceil(minutesUntilNextCycle)} min`;
    }

    if (isRaining) {
      const minutesLeft = Math.ceil(rainStartMin + rainDuration - cycleMin);
      return `Raining now, ends in ${minutesLeft} min`;
    }

    if (cycleMin < rainStartMin) {
      const minutesUntil = Math.ceil(rainStartMin - cycleMin);
      return `Next rain in ${minutesUntil} min for ${rainDuration} min`;
    }

    return 'Rain just ended, next expected in ~3 cycles';
  })();

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg text-black mb-4">
      <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
      <div className="mb-6 p-2 bg-blue-200 rounded text-center font-medium">
        {weather} - {phase === 'day' ? 'Day' : 'Night'}
      </div>

      <div className="mb-6 p-2 bg-yellow-100 rounded text-center font-medium">
        <div>
          Phase: <strong>{phase === 'day' ? 'Day' : 'Night'}</strong>
        </div>

        {/* Day/Night Bar */}
        <div className="relative w-full h-4 mt-1 mb-2 rounded overflow-hidden border border-black">
          <div className="absolute top-0 left-0 h-full w-[80%] bg-cyan-300" />
          <div className="absolute top-0 left-[80%] h-full w-[20%] bg-blue-900" />
          <div
            className="absolute top-0 h-full w-3 bg-green-500 transition-all"
            style={{ left: `${(cycleMin / 150) * 100}%` }}
          />
        </div>

        <div>
          Time: <strong>{formatRealTime()}</strong>
        </div>
        <div>{rainInfo}</div>
      </div>
    </div>
  );
}