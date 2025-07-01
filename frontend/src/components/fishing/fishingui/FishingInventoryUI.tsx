import React from 'react'

type FishStack = {
  species: string
  rarity: string
  modifier?: string | null
  quantity: number
  max_weight: number
  max_length: number
}

type BiggestFish = {
  species: string;
  rarity?: string | null;
  modifier?: string | null;
  max_weight: number;
  max_length: number;
  caught_at: string;
}

type Resource = {
  name: string
  quantity: number
  rarity?: string | null;
}

type Props = {
  data: {
    fishStacks: FishStack[]
    biggestFish: BiggestFish[]
    email?: string
    currency?: Record<string, number>
    resources?: Resource[]
    gear?: { name: string; type: string }[]
    bait?: { bait_type: string; quantity: number }[]
    current_zone_id: number | null
  } | null
  loading: boolean
  error: string | null
}

const zoneMap: Record<number, string> = {
  1: 'Jungle',
  2: 'Ocean',
  3: 'River',
  4: 'Lava',
}

export function FishingInventoryUI({ data, loading, error }: Props) {
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!data) return <p>No data</p>

  const {
    email,
    currency,
    fishStacks,
    biggestFish,
    resources,
    gear,
    bait,
    current_zone_id,
  } = data

  const zoneName = current_zone_id ? zoneMap[current_zone_id] || `Unknown Zone (${current_zone_id})` : 'No zone selected'

  return (
    <div>
      <p>
        <strong>Username:</strong> {email ? email.split('@')[0] : 'Unknown'} &nbsp;|&nbsp;{' '}
        <strong>Current Zone:</strong> {zoneName} &nbsp;|&nbsp;{' '}
        <strong>Gold:</strong> {currency?.gold || 0}{' '}
        <strong>Pearls:</strong> {currency?.pearls || 0}{' '}
        <strong>Coral Shards:</strong> {currency?.coral_shards || 0}{' '}
        <strong>Echo Shards:</strong> {currency?.echo_shards || 0} &nbsp;|&nbsp;{' '}
        <strong>Gear:</strong>{' '}
        {gear?.length ? gear.map(g => `${g.name} (${g.type})`).join(', ') : 'No gear'} &nbsp;|&nbsp;{' '}
        <strong>Bait:</strong>{' '}
        {bait?.length ? bait.map(b => `${b.bait_type}: ${b.quantity}`).join(', ') : 'No bait'}
      </p>

      <section>
        <h3>Resources:</h3>
        {resources && resources.length ? (
          <ul>
            {resources.map((r, i) => (
              <li key={i}>
                 {r.name} {r.rarity ? `(${r.rarity})` : ''} — Qty: {r.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No resources</p>
        )}
      </section>

      <section>
        <h3>Fish Inventory:</h3>
        {fishStacks.length ? (
          <ul>
            {fishStacks.map((f, i) => (
              <li key={i}>
                {f.species} {f.rarity ? `(${f.rarity})` : ''} {f.modifier ? `(${f.modifier})` : ''} — Qty: {f.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No fish caught</p>
        )}
      </section>

      <section>
        <h3>Biggest Fish (All Time):</h3>
        {biggestFish.length ? (
          <ul>
            {biggestFish.map((bf, i) => (
              <li key={i}>
                {bf.species} {bf.rarity ? `(${bf.rarity})` : ''} {bf.modifier ? `(${bf.modifier})` : ''} —{' '}
                {typeof bf.max_weight === 'number' ? bf.max_weight.toFixed(2) : 'N/A'} lbs /{' '}
                {typeof bf.max_length === 'number' ? bf.max_length.toFixed(2) : 'N/A'} in caught on{' '}
                {new Date(bf.caught_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No biggest fish recorded</p>
        )}
      </section>
    </div>
  )
}