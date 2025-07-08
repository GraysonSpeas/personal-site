// src/components/fishing/fishingui/FishingInventoryUI.ts
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
  rarity?: string | null
  modifier?: string | null
  max_weight: number
  max_length: number
  caught_at: string
}

type Resource = {
  name: string
  quantity: number
  rarity?: string | null
}

type Gear = {
  gear_id: number
  name: string
  type: string
  type_id?: number
  stats?: Record<string, any>
  equipped?: boolean
}

type Bait = {
  bait_id: number
  bait_type: string
  quantity: number
  type_id?: number
  stats?: Record<string, any>
  sell_price?: number
  equipped?: boolean
}

type Props = {
  data: {
    fishStacks: FishStack[]
    biggestFish: BiggestFish[]
    email?: string
    currency?: Record<string, number>
    resources?: Resource[]
    gear?: Gear[]
    bait?: Bait[]
    current_zone_id: number | null
    xp?: number
    level?: number
  } | null
  loading: boolean
  error: string | null
  xpDisplay?: string
}

const zoneMap: Record<number, string> = {
  1: 'Jungle',
  2: 'Ocean',
  3: 'River',
  4: 'Lava',
}

export function FishingInventoryUI({ data, loading, error, xpDisplay }: Props) {
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
    xp,
    level,
  } = data

  const zoneName = current_zone_id
    ? zoneMap[current_zone_id] || `Unknown Zone (${current_zone_id})`
    : 'No zone selected'

  return (
    <div>
      <p>
        <strong>Username:</strong> {email ? email.split('@')[0] : 'Unknown'} &nbsp;|&nbsp;{' '}
        <strong>Level:</strong> {level ?? 1} &nbsp;|&nbsp;{' '}
        {(() => {
  const xpCurrent = xp ?? 0;
  const levelCurrent = level ?? 1;

  const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));
  const totalXpToLevel = (n: number) => {
    let total = 0;
    for (let i = 1; i < n; i++) total += xpToLevel(i);
    return total;
  };

  const xpNextLevel = totalXpToLevel(levelCurrent + 1);
  const xpPrevLevel = totalXpToLevel(levelCurrent);
  const xpNeeded = xpNextLevel - xpPrevLevel;
  const xpIntoLevel = xpCurrent - xpPrevLevel;

  return (
    <>
      <strong>XP:</strong> {xpIntoLevel} / {xpNeeded} &nbsp;|&nbsp;{' '}
    </>
  );
})()}

        <strong>Current Zone:</strong> {zoneName} &nbsp;|&nbsp;{' '}
        <strong>Gold:</strong> {currency?.gold || 0}{' '}
        <strong>Pearls:</strong> {currency?.pearls || 0}{' '}
        <strong>Coral Shards:</strong> {currency?.coral_shards || 0}{' '}
        <strong>Echo Shards:</strong> {currency?.echo_shards || 0}
      </p>

      <section>
        <h3>Gear:</h3>
        {gear?.length ? (
          <ul>
            {gear.map((g, i) => (
              <li key={i}>
                {g.name} ({g.type}) {g.equipped ? <strong>(Equipped)</strong> : null} — ID: {g.gear_id} —{' '}
                {g.type_id ? `Type ID: ${g.type_id} — ` : ''}
                Stats: {g.stats ? JSON.stringify(g.stats) : 'None'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No gear</p>
        )}
      </section>

      <section>
        <h3>Bait:</h3>
        {bait?.length ? (
          <ul>
            {bait.map((b, i) => (
              <li key={i}>
                {b.bait_type} {b.equipped ? <strong>(Equipped)</strong> : null} — Qty: {b.quantity} — ID: {b.bait_id}{' '}
                {b.type_id ? `— Type ID: ${b.type_id}` : ''}{' '}
                {b.stats ? ` — Stats: ${JSON.stringify(b.stats)}` : ''}{' '}
                {b.sell_price ? ` — Sell Price: ${b.sell_price}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p>No bait</p>
        )}
      </section>

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