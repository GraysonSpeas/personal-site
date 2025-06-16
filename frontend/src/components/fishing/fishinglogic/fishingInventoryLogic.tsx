import { useEffect, useState } from 'react';

interface Fish {
  species: string;
  rarity: string;
  modifier?: string | null;
  weight: number;
  length: number;
  quantity?: number;
  [key: string]: any;
}

interface BiggestFish {
  species: string;
  modifier?: string | null;
  max_weight: number;
  max_length: number;
  caught_at: string;
}

interface FishStack {
  species: string;
  rarity: string;
  modifier?: string | null;
  quantity: number;
  max_weight: number;
  max_length: number;
}

interface FishingInventoryRaw {
  fish: Fish[];
  biggestFish: BiggestFish[];  // now an array
  currentZoneId: number | null;
  [key: string]: any;
}

interface FishingInventoryProcessed {
  fishStacks: FishStack[];
  biggestFish: BiggestFish[];  // array here too
  current_zone_id: number | null;
  [key: string]: any;
}

export function useFishingInventory() {
  const [data, setData] = useState<FishingInventoryProcessed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function processFishInventory(fishList: Fish[], biggestFishList: BiggestFish[]) {
    const fishMap = new Map<string, FishStack>();

    for (const fish of fishList) {
      const key = `${fish.species}-${fish.modifier ?? 'normal'}`;
      const existing = fishMap.get(key);

      if (existing) {
        existing.quantity += fish.quantity ?? 1;
        if (fish.weight > existing.max_weight) existing.max_weight = fish.weight;
        if (fish.length > existing.max_length) existing.max_length = fish.length;
      } else {
        fishMap.set(key, {
          species: fish.species,
          rarity: fish.rarity,
          modifier: fish.modifier ?? null,
          quantity: fish.quantity ?? 1,
          max_weight: fish.weight,
          max_length: fish.length,
        });
      }
    }

    return {
      fishStacks: Array.from(fishMap.values()),
      biggestFish: biggestFishList || [],
    };
  }

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const json: FishingInventoryRaw = await res.json();

      const processed = processFishInventory(json.fish || [], json.biggestFish || []);

      setData({
        ...processed,
        current_zone_id: json.currentZoneId ?? null,
      });
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return { data, loading, error, refetch: fetchInventory };
}