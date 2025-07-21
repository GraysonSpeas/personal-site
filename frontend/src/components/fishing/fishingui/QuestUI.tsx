import React from 'react';

interface QuestType {
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

interface QuestUIProps {
  quests: QuestType[];
}

export function QuestUI({ quests }: QuestUIProps) {
  if (!quests.length) return <section className="mb-4"><p className="text-black">No active quests.</p></section>;

  const grouped = {
    daily: quests.filter(q => q.type === 'daily').sort((a, b) => a.id - b.id),
    weekly: quests.filter(q => q.type === 'weekly').sort((a, b) => a.id - b.id),
    monthly: quests.filter(q => q.type === 'monthly').sort((a, b) => a.id - b.id),
  };

  const renderQuests = (questList: QuestType[]) =>
    questList.map(({ key, description, progress, target, completed, reward_xp, reward_gold }) => {
      const reward = reward_xp != null && reward_gold != null ? { xp: reward_xp, gold: reward_gold } : undefined;

      return (
        <div
          key={key}
          className={`quest-item p-3 rounded border ${
            completed ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'
          }`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
          style={{ maxWidth: 240 }}
        >
          <h3 className="font-semibold text-md text-black">{description}</h3>
          <p className="text-black text-sm">
            Progress: {progress} / {target}{' '}
            {progress === target && <span className="text-green-700 font-bold">(Completed)</span>}
          </p>

          {reward ? (
            <p className="text-black text-xs">
              Reward: <span className="font-semibold">{reward.xp} XP</span>,{' '}
              <span className="font-semibold">{reward.gold} Gold</span>
            </p>
          ) : (
            <p className="text-black text-xs italic">No reward available</p>
          )}

          <progress
            value={progress}
            max={target}
            className="w-full mt-1"
            aria-label={`Progress for quest: ${description}`}
          />
        </div>
      );
    });

  return (
    <section
      aria-label="Quests"
      className="max-w-full mx-auto p-4 text-black mb-4"
      style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}
    >
      {(['daily', 'weekly', 'monthly'] as const).map(type => (
        <div key={type} style={{ flex: 1, minWidth: 240, maxWidth: 260 }}>
          <div className="bg-white p-2 rounded shadow mb-4 inline-block">
            <h2 className="text-lg font-bold capitalize">{type} Quests</h2>
          </div>

          {grouped[type].length > 0 ? (
            <div className="space-y-3">{renderQuests(grouped[type])}</div>
          ) : (
            <p className="text-black italic text-sm">No {type} quests.</p>
          )}
        </div>
      ))}
    </section>
  );
}