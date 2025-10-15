import { useState, useEffect } from 'react';
import { API_BASE } from '../../../config.tsx';

type BiggestFish = {
  species: string;
  max_weight: number;
  max_length: number;
  rarity: string;
  caught_at: string;
  caught: boolean;
};

type Collection = {
  key: string;
  species: string[];
  total: number;
  caught: number;
  completed: number;
  completed_at?: string;
  claimed: number;
  reward_gold: number;
  reward_xp: number;
  claimable: boolean;
  biggestFish?: BiggestFish[];
};

type Achievement = {
  key: string;
  rarity: string;
  thresholds: number[];
  progress: number;
  completed: number;
  claimable_stages: { stage: number; reward_gold: number; reward_xp: number }[];
  reward_gold: number[];
  reward_xp: number[];
  next_threshold: number;
  next_reward_gold: number;
  next_reward_xp: number;
};


type CollectionsProps = {
  refreshInventory?: () => void;
};

export default function Collections({ refreshInventory }: CollectionsProps) {
  const [activeTab, setActiveTab] = useState<'collections' | 'achievements'>('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`${API_BASE}/collections`, {
        credentials: 'include',
      });
      const data = await res.json();
      setCollections(data.collections || []);
      setAchievements(data.achievements || []);
      setLoading(false);
    }
    fetchData();
  }, []);

const handleClaim = async (
  type: 'collection' | 'achievement',
  key: string,
  stage?: number,
  refreshInventory?: () => void
) => {
  try {
    const res = await fetch(`${API_BASE}/collections/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, key, stage }),
      credentials: 'include',
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed to claim');
      return;
    }

    // Refresh collections & achievements locally
    const refresh = await fetch(`${API_BASE}/collections`);
    const updated = await refresh.json();
    setCollections(updated.collections || []);
    setAchievements(updated.achievements || []);

    // Trigger parent refresh if provided
    if (refreshInventory) refreshInventory();

  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab==='collections'?'bg-blue-500 text-white':'bg-gray-200'}`}
          onClick={()=>setActiveTab('collections')}
        >
          Collections
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab==='achievements'?'bg-blue-500 text-white':'bg-gray-200'}`}
          onClick={()=>setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {activeTab==='collections' && (
        <div className="space-y-4">
{collections.map(col => {
  const isClaimed = col.claimed > 0;
  return (
    <div
      key={col.key}
      className={`p-4 border rounded shadow ${col.caught === 0 ? 'text-gray-500 bg-gray-100' : 'text-black bg-white'}`}
    >
      <h3 className="font-bold text-lg">{col.key.replace(/_/g, ' ')}</h3>

      <p className={col.completed ? 'text-green-600 font-semibold' : ''}>
        Progress: {col.caught}/{col.total} {col.completed ? '(Complete)' : ''}
      </p>

      <p>Gold: {col.reward_gold}, XP: {col.reward_xp}</p>

      <button
        onClick={() => handleClaim('collection', col.key, undefined, refreshInventory)}
        disabled={!col.claimable}
        className={`mt-2 px-3 py-1 rounded ${
          col.claimable
            ? 'bg-green-600 text-white hover:bg-green-700'
            : isClaimed
              ? 'bg-gray-400 text-white cursor-not-allowed' // dimmed green
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {col.claimable ? 'Claim Reward' : isClaimed ? 'Claimed' : 'Not Ready'}
      </button>

      {col.biggestFish && (
        <div className="mt-2">
          <h4 className="font-semibold">Biggest Fish:</h4>
          <ul>
            {col.biggestFish.map(f => (
              <li key={f.species} className={f.caught ? '' : 'text-gray-400'}>
                {f.caught
                  ? `${f.species}: ${f.max_weight} kg, ${f.max_length} cm (${f.rarity})`
                  : `${f.species}: Not caught`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
})}
        </div>
      )}

      {activeTab==='achievements' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {achievements.map(ach => (
      <div
        key={ach.key}
        className={`p-4 border rounded shadow ${ach.progress===0 ? 'text-gray-500 bg-gray-100' : 'text-black bg-white'}`}
      >
        <h3 className="font-bold">{ach.key.replace(/_/g,' ')}</h3>
        <p>Rarity: {ach.rarity}</p>

{ach.thresholds.map((threshold, index) => {
  const claimedStage = ach.claimable_stages.find(s => s.stage === threshold);
  const isClaimed = !claimedStage && ach.progress >= threshold;

  return (
    <div key={threshold} className="mt-2">
      {/* Progress text in bright green if complete */}
      <p className={ach.progress >= threshold ? 'text-green-600 font-semibold' : ''}>
        Progress: {Math.min(ach.progress, threshold)}/{threshold} {ach.progress >= threshold ? '(Complete)' : ''}
      </p>

      <p>Reward (tier {index + 1}): Gold {ach.reward_gold[index]}, XP {ach.reward_xp[index]}</p>

<button
  onClick={() => handleClaim('achievement', ach.key, threshold, refreshInventory)}
  disabled={!claimedStage}
  className={`mt-1 px-3 py-1 rounded ${
    claimedStage
      ? 'bg-green-600 text-white hover:bg-green-700'
      : isClaimed
        ? 'bg-gray-400 text-white cursor-not-allowed' // dark gray button, green text
        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
  }`}
>
  {claimedStage ? 'Claim' : isClaimed ? 'Claimed' : 'Not Ready'}
</button>
    </div>
  );
})}
      </div>
    ))}
  </div>
)}
    </div>
  );
}