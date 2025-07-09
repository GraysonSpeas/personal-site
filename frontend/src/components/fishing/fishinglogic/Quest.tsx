import React from 'react';

interface Quest {
  key: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

interface QuestProps {
  quests: Quest[];
}

export function Quest({ quests }: QuestProps) {
  if (quests.length === 0) {
    return <p>No active quests.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quests</h2>
      <ul>
        {quests.map((quest) => (
          <li
            key={quest.key}
            className={`p-2 border-b last:border-b-0 ${quest.completed ? 'bg-green-200' : ''}`}
          >
            <div className="font-medium">{quest.description}</div>
            <div>
              Progress: {quest.progress} / {quest.target}{' '}
              {quest.completed && <span className="text-green-600 font-bold">✓ Completed</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}