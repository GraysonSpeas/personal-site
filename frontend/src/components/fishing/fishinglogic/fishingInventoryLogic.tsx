import { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../../config';

type FishStack = {
  species: string;
  rarity: string;
  modifier?: string | null;
  quantity: number;
  max_weight: number;
  max_length: number;
};

type BiggestFish = {
  species: string;
  rarity?: string | null;
  modifier?: string | null;
  max_weight: number;
  max_length: number;
  caught_at: string;
};

type Resource = {
  name: string;
  quantity: number;
  rarity?: string | null;
};

type Gear = {
  gear_id: number;
  name: string;
  type: string;
  type_id?: number;
  stats?: Record<string, any>;
  equipped?: boolean;
};

type Bait = {
  bait_id: number;
  bait_type: string;
  quantity: number;
  type_id?: number;
  stats?: Record<string, any>;
  sell_price?: number;
  equipped?: boolean;
};

type Consumable = {
  consumable_id: number;
  type_id: number;
  name: string;
  quantity: number;
  consumable_type?: string;
  stats?: Record<string, any>;
};

export type InventoryData = {
  fishStacks: FishStack[];
  biggestFish: BiggestFish[];
  email?: string;
  currency?: Record<string, number>;
  resources?: Resource[];
  gear?: Gear[];
  bait?: Bait[];
  consumables?: Consumable[];
  current_zone_id: number | null;
  xp?: number;
  level?: number;
};

// XP calculation helpers
function xpToLevel(n: number): number {
  return Math.round(10 * Math.pow(1.056, n - 1));
}

export function totalXpToLevel(n: number): number {
  let total = 0;
  for (let i = 1; i < n; i++) total += xpToLevel(i);
  return total;
}

export function useFishingInventory() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inventory`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();

      setData({
        fishStacks: json.fishStacks || json.fish || [],
        biggestFish: json.biggestFish || [],
        email: json.email,
        currency: json.currency,
        resources: json.resources,
        gear: json.gear,
        bait: json.bait,
        consumables: json.consumables || [],
        current_zone_id: json.current_zone_id ?? json.currentZoneId ?? null,
        xp: json.xp,
        level: json.level,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const xpNeeded = data && data.level ? totalXpToLevel(data.level + 1) - (data.xp ?? 0) : 0;
  const xpDisplay = data ? `${data.xp ?? 0} / ${totalXpToLevel((data.level ?? 1) + 1)}` : '';

  return { data, loading, error, refetch: fetchInventory, xpNeeded, xpDisplay };
}