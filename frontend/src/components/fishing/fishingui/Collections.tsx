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
  next_threshold: number;
  next_reward_gold: number;
  next_reward_xp: number;
};

export default function Collections() {
  const [activeTab, setActiveTab] = useState<'collections' | 'achievements'>('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`${API_BASE}/collections`);
      const data = await res.json();
      setCollections(data.collections || []);
      setAchievements(data.achievements || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button className={`px-4 py-2 rounded ${activeTab==='collections'?'bg-blue-500 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('collections')}>Collections</button>
        <button className={`px-4 py-2 rounded ${activeTab==='achievements'?'bg-blue-500 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('achievements')}>Achievements</button>
      </div>

      {activeTab==='collections' && (
        <div className="space-y-4">
          {collections.map(col => (
            <div key={col.key} className={`p-4 border rounded shadow ${col.caught===0?'text-gray-500 bg-gray-100':'text-black bg-white'}`}>
              <h3 className="font-bold text-lg">{col.key.replace(/_/g,' ')}</h3>
              <p>Caught: {col.caught}/{col.total} | Status: {col.completed?'Completed':'In progress'}</p>
              {col.claimable && <p className="text-green-600 font-semibold">Reward Available!</p>}
              <p>Gold: {col.reward_gold}, XP: {col.reward_xp}</p>

              {col.biggestFish && (
                <div className="mt-2">
                  <h4 className="font-semibold">Biggest Fish:</h4>
                  <ul>
                    {col.biggestFish.map(f => (
                      <li key={f.species} className={f.caught?'':'text-gray-400'}>
                        {f.caught
                          ? `${f.species}: ${f.max_weight} kg, ${f.max_length} cm (${f.rarity})`
                          : `${f.species}: Not caught`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab==='achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => {
            const currentTierIndex = ach.thresholds.findIndex(t=>t>ach.progress);
            const tierMax = ach.thresholds[currentTierIndex]||ach.thresholds[ach.thresholds.length-1];
            const tierMin = currentTierIndex>0 ? ach.thresholds[currentTierIndex-1]:0;
            const tierProgress = ach.progress - tierMin;
            const displayTier = currentTierIndex+1;

            return (
              <div key={ach.key} className={`p-4 border rounded shadow ${ach.progress===0?'text-gray-500 bg-gray-100':'text-black bg-white'}`}>
                <h3 className="font-bold">{ach.key.replace(/_/g,' ')}</h3>
                <p>Rarity: {ach.rarity}</p>
                <p>Progress: {tierProgress}/{tierMax - tierMin}</p>
                {ach.next_threshold>0
                  ? <p className="text-green-600 font-semibold">Next Reward (tier {displayTier}): Gold {ach.next_reward_gold}, XP {ach.next_reward_xp}</p>
                  : <p className="text-gray-500 font-semibold">All rewards claimed</p>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}