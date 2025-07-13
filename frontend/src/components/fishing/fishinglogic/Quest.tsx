import React from 'react';

interface QuestType {
  key: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'monthly';
  reward_xp?: number; // add reward_xp
  reward_gold?: number; // add reward_gold
}


interface QuestProps {
  quests: QuestType[];
}

export function Quest({ quests }: QuestProps) {
  if (!quests.length) return <p className="text-black">No active quests.</p>;

  const grouped = {
    daily: quests.filter(q => q.type === 'daily'),
    weekly: quests.filter(q => q.type === 'weekly'),
    monthly: quests.filter(q => q.type === 'monthly'),
  };

const renderQuests = (questList: QuestType[]) =>
  questList.map(({ key, description, progress, target, completed, reward_xp, reward_gold }) => {
    // Combine reward_xp and reward_gold into the reward object
    const reward = reward_xp != null && reward_gold != null ? { xp: reward_xp, gold: reward_gold } : undefined;

    return (
      <div
        key={key}
        className={`quest-item p-4 mb-4 rounded border ${
          completed ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'
        }`}
        role="region"
        aria-live="polite"
        aria-atomic="true"
      >
        <h3 className="font-semibold text-lg text-black">{description}</h3>
        <p className="text-black">
          Progress: {progress} / {target}{' '}
          {progress === target && <span className="text-green-700 font-bold">(Completed)</span>}
        </p>

        {/* Check if reward is available before accessing xp and gold */}
        {reward ? (
          <p className="text-black text-sm">
            Reward: <span className="font-semibold">{reward.xp} XP</span>,{' '}
            <span className="font-semibold">{reward.gold} Gold</span>
          </p>
        ) : (
          <p className="text-black text-sm">No reward available</p>
        )}

        <progress
          value={progress}
          max={target}
          className="w-full mt-2"
          aria-label={`Progress for quest: ${description}`}
        />
      </div>
    );
  });


  return (
    <section aria-label="Quests" className="max-w-md mx-auto p-4 text-black space-y-8">
      {(['daily', 'weekly', 'monthly'] as const).map((type) => (
        <div key={type}>
          <h2 className="text-xl font-bold capitalize mb-4">{type} Quests</h2>
          {grouped[type].length > 0 ? (
            renderQuests(grouped[type])
          ) : (
            <p className="text-black italic">No {type} quests.</p>
          )}
        </div>
      ))}
    </section>
  );
}