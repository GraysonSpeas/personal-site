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
  species: string
  modifier?: string | null
  max_weight: number
  max_length: number
  caught_at: string
}

type Props = {
  data: {
    fishStacks: FishStack[]
    biggestFish: BiggestFish[]  // Changed to array
    email?: string
    currency?: Record<string, number>
    resources?: { resource_name: string; quantity: number }[]
    gear?: { name: string; type: string }[]
    bait?: { bait_type: string; quantity: number }[]
    current_zone_id: number | null
  } | null
  loading: boolean
  error: string | null
}

// Map zone IDs to names
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
      <h2>Username: {email || 'Unknown'}</h2>

      <h3>Current Zone</h3>
      <p>{zoneName}</p>

      <h3>Currency</h3>
      <ul>
        <li>Gold: {currency?.gold ?? 0}</li>
        <li>Pearls: {currency?.pearls ?? 0}</li>
        <li>Coral Shards: {currency?.coral_shards ?? 0}</li>
        <li>Echo Shards: {currency?.echo_shards ?? 0}</li>
      </ul>

      <h3>Fish Inventory</h3>
      <ul>
        {fishStacks.length ? fishStacks.map((f, i) => (
          <li key={i}>
            {f.species} {f.modifier ? `(${f.modifier})` : ''} — Qty: {f.quantity}
          </li>
        )) : <li>No fish caught</li>}
      </ul>

      <h3>Biggest Fish (All Time)</h3>
      {biggestFish.length ? (
        <ul>
          {biggestFish.map((bf, i) => (
            <li key={i}>
              {bf.species} {bf.modifier ? `(${bf.modifier})` : ''} — {typeof bf.max_weight === 'number' ? bf.max_weight.toFixed(2) : 'N/A'} lbs / {typeof bf.max_length === 'number' ? bf.max_length.toFixed(2) : 'N/A'} in caught on {new Date(bf.caught_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No biggest fish recorded</p>
      )}

      <h3>Resources</h3>
      <ul>
        {resources?.length ? resources.map((r, i) => (
          <li key={i}>
            {r.resource_name}: {r.quantity}
          </li>
        )) : <li>No resources</li>}
      </ul>

      <h3>Gear</h3>
      <ul>
        {gear?.length ? gear.map((g, i) => (
          <li key={i}>
            {g.name} ({g.type})
          </li>
        )) : <li>No gear</li>}
      </ul>

      <h3>Bait</h3>
      <ul>
        {bait?.length ? bait.map((b, i) => (
          <li key={i}>
            {b.bait_type}: {b.quantity}
          </li>
        )) : <li>No bait</li>}
      </ul>
    </div>
  )
}