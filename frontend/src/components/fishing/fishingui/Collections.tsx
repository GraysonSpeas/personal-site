import { useState, useEffect } from 'react'
import { API_BASE } from '../../../config.tsx';

type BiggestFish = {
  species: string
  weight: number
  length: number
  rarity: string
}

type Collection = {
  key: string
  species: string[]
  total: number
  caught: number
  completed: number
  claimed: number
  reward_gold: number
  reward_xp: number
  claimable: boolean
  biggestFish?: BiggestFish[]
}

type Achievement = {
  key: string
  rarity: string
  thresholds: number[]
  progress: number
  completed: number
  claimable_stages: number[]
  reward_gold: number
  reward_xp: number
}

export default function Collections() {
  const [activeTab, setActiveTab] = useState<'collections' | 'achievements'>('collections')
  const [collections, setCollections] = useState<Collection[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const res = await fetch(`${API_BASE}/collections`)
      const data = await res.json()

      const collectionsWithFish: Collection[] = data.collections.map((col: any) => ({
        ...col,
        biggestFish: col.species.map((s: string) => {
          const fish = data.biggest_fish?.find((f: BiggestFish) => f.species === s)
          return fish || { species: s, weight: 0, length: 0, rarity: 'none' }
        }),
      }))

      setCollections(collectionsWithFish)
      setAchievements(data.achievements || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'collections' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'achievements' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          {collections.map(col => (
            <div
              key={col.key}
              className={`p-4 border rounded shadow ${
                col.caught === 0 ? 'text-gray-500 bg-gray-100' : 'text-black bg-white'
              }`}
            >
              <h3 className="font-bold text-lg">{col.key.replace('_', ' ')}</h3>
              <p>
                Caught: {col.caught}/{col.total} | Status: {col.completed ? 'Completed' : 'In progress'}
              </p>
              {col.claimable && <p className="text-green-600 font-semibold">Reward Available!</p>}
              <p>Gold: {col.reward_gold}, XP: {col.reward_xp}</p>
              {col.biggestFish && (
                <div className="mt-2">
                  <h4 className="font-semibold">Biggest Fish:</h4>
                  <ul>
                    {col.biggestFish.map(f => (
                      <li key={f.species}>
                        {f.species}: {f.weight} kg, {f.length} cm ({f.rarity})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.key}
              className={`p-4 border rounded shadow ${
                ach.progress === 0 ? 'text-gray-500 bg-gray-100' : 'text-black bg-white'
              }`}
            >
              <h3 className="font-bold">{ach.key.replace('_', ' ')}</h3>
              <p>Rarity: {ach.rarity}</p>
              <p>Progress: {ach.progress}/{ach.thresholds[0]}</p>
              {ach.claimable_stages.length > 0 && (
                <p className="text-green-600 font-semibold">
                  Claimable: {ach.claimable_stages.join(', ')}
                </p>
              )}
              <p>Gold: {ach.reward_gold}, XP: {ach.reward_xp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}