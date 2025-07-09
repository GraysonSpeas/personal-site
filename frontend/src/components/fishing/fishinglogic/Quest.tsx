import React from 'react';

interface QuestType {
  key: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

interface QuestProps {
  quests: QuestType[];
}

export function Quest({ quests }: QuestProps) {
  if (!quests.length) return <p>No active quests.</p>;

  return (
    <section aria-label="Quests" className="max-w-md mx-auto p-4">
      {quests.map(({ key, description, progress, target, completed }) => (
        <div
          key={key}
          className={`quest-item p-4 mb-4 rounded border ${
            completed ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'
          }`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className="font-semibold text-lg">{description}</h3>
          <p>
            Progress: {progress} / {target}{' '}
            {completed && <span className="text-green-700 font-bold">(Completed)</span>}
          </p>
          <progress
            value={progress}
            max={target}
            className="w-full mt-2"
            aria-label={`Progress for quest: ${description}`}
          />
        </div>
      ))}
    </section>
  );
}