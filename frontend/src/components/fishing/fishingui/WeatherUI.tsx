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
  return cstNow.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
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

  const minutesToRealTime = (minOffset: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minOffset);
    return now.toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!rainCycle || rainStartMin === null) {
    const cyclesUntilRain = (3 - (cycleNum % 3)) % 3 || 3;
    const minutesUntilNextCycle = (150 - cycleMin) + 150 * (cyclesUntilRain - 1);
    const time = minutesToRealTime(minutesUntilNextCycle);
    return `Next Rainstorm: ${time}`;
  }

  if (isRaining) {
    const minutesLeft = rainStartMin + rainDuration - cycleMin;
    const time = minutesToRealTime(minutesLeft);
    return `Raining now, ends at ${time}`;
  }

  if (cycleMin < rainStartMin) {
    const minutesUntil = rainStartMin - cycleMin;
    const time = minutesToRealTime(minutesUntil);
    return `Next rain at ${time} for ${rainDuration} min`;
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
          Phase: {phase === 'day' ? 'Day' : 'Night'}
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
          Time: {formatRealTime()}
        </div>
        <div>{rainInfo}</div>
      </div>
    </div>
  );
}