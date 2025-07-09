import React from 'react';

interface CatchFish {
  species: string;
  rarity: string;
  sellLimit: number;
}

interface DailyCatchProps {
  catchOfTheDay: CatchFish[];
}

export function DailyCatch({ catchOfTheDay }: DailyCatchProps) {
  if (catchOfTheDay.length === 0) {
    return <p>No daily catch available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Catch of the Day</h2>
      <ul className="mb-6">
        {catchOfTheDay.map((fish) => (
          <li key={fish.species} className="p-2 border-b last:border-b-0">
            <strong>{fish.species}</strong> ({fish.rarity}) — Sell limit: {fish.sellLimit}
          </li>
        ))}
      </ul>
    </div>
  );
}
