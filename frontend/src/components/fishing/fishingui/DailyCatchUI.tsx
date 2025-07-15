import React from 'react';

interface CatchFish {
  species: string;
  rarity: string;
  sellLimit: number;
}

interface DailyCatchUIProps {
  catchOfTheDay: CatchFish[];
}

export function DailyCatchUI({ catchOfTheDay }: DailyCatchUIProps) {
  if (!catchOfTheDay.length) {
    return <p className="text-black">No catch available today.</p>;
  }

  return (
    <section aria-label="Daily Catch" className="max-w-full mx-auto p-4 text-black">
      <h2 className="text-xl font-bold mb-4">Catch of the Day</h2>
      <ul>
        {catchOfTheDay.map(({ species, rarity, sellLimit }) => (
          <li key={species} className="mb-2">
            <strong>{species}</strong> — Rarity: {rarity}, Sell Limit: {sellLimit}
          </li>
        ))}
      </ul>
    </section>
  );
}