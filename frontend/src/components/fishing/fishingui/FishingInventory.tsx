import React from 'react';
import type { InventoryData } from '../FishingUI';

// ---- XP helpers ----
function xpToLevel(n: number): number {
  return Math.round(10 * Math.pow(1.056, n - 1));
}
function totalXpToLevel(n: number): number {
  let total = 0;
  for (let i = 1; i < n; i++) total += xpToLevel(i);
  return total;
}

// ---- Props ----
type FishingInventoryProps = {
  data: InventoryData;
  onGearData?: (gear?: any[], bait?: any[]) => React.ReactNode;
};

// ---- Component ----
export function FishingInventory({ data, onGearData }: FishingInventoryProps) {
  if (!data) return <p>No inventory data.</p>;

  const xpNeeded =
    data.level != null ? totalXpToLevel(data.level + 1) - (data.xp ?? 0) : 0;
  const xpDisplay =
    data.level != null ? `${data.xp ?? 0} / ${totalXpToLevel(data.level + 1)}` : '';

  return (
    <div
      style={{
        padding: 12,
        border: '1px solid #ccc',
        borderRadius: 6,
        background: '#fafafa',
        color: 'black',
      }}
    >
      <h2><strong>Inventory</strong></h2>

      {/* Username */}
      {data.email && <p><strong>User:</strong> {data.email}</p>}
      
{/* Current Zone */}
{data.current_zone_id && (
  <div>
    <strong>Current Zone:</strong> {data.current_zone_id}
  </div>
)}

      {/* Currency */}
      {data.currency && (
        <div>
          <strong>Currencies:</strong>
          <ul>
            {Object.entries(data.currency).map(([c, v]) => (
              <li key={c}><strong>{c}</strong>: {v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* XP */}
      <div>
        <strong>Level:</strong> {data.level ?? 1} ({xpDisplay})  
        <br />
        <small><strong>{xpNeeded}</strong> XP to next level</small>
      </div>

      {/* Fish */}
      <div>
        <strong>Fish:</strong>
        <ul>
          {data.fishStacks.map((f, i) => (
            <li key={i}>
              <strong>{f.quantity}x</strong> {f.species} ({f.rarity})
            </li>
          ))}
        </ul>
      </div>

      {/* Biggest Fish */}
      {data.biggestFish && (
        <div>
          <strong>Biggest Fish:</strong>
          <ul>
            {data.biggestFish.map((bf, i) => (
              <li key={i}>
                {bf.species} ({bf.rarity}) — <strong>{bf.max_weight}kg</strong>, <strong>{bf.max_length}cm</strong>, caught at {new Date(bf.caught_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {data.resources && (
        <div>
          <strong>Resources:</strong>
          <ul>
            {data.resources.map((r, i) => (
              <li key={i}>
                {r.name} x<strong>{r.quantity}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gear */}
      {data.gear && (
        <div>
          <strong>Gear:</strong>
          <ul>
            {data.gear.map((g, i) => (
              <li key={i}>
                {g.name} ({g.type}) {g.equipped ? '✅ equipped' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bait */}
      {data.bait && (
        <div>
          <strong>Bait:</strong>
          <ul>
            {data.bait.map((b, i) => (
              <li key={i}>
                {b.bait_type} x<strong>{b.quantity}</strong> {b.equipped ? '✅ equipped' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consumables */}
      {data.consumables && (
        <div>
          <strong>Consumables:</strong>
          <ul>
            {data.consumables.map((c, i) => (
              <li key={i}>
                {c.consumable_type} x<strong>{c.quantity}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Seeds */}
      {data.seeds && (
        <div>
          <strong>Seeds:</strong>
          <ul>
            {data.seeds.map((s, i) => (
              <li key={i}>
                {s.name} x<strong>{s.quantity}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pass gear/bait up if needed */}
      {onGearData && onGearData(data.gear, data.bait)}
    </div>
  );
}