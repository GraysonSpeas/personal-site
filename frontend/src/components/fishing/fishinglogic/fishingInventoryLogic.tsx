// src/components/fishing/fishinglogic/fishingInventoryLogic.ts
import { useEffect, useState, useCallback } from 'react';

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

export type InventoryData = {
  fishStacks: FishStack[];
  biggestFish: BiggestFish[];
  email?: string;
  currency?: Record<string, number>;
  resources?: Resource[];
  gear?: Gear[];
  bait?: Bait[];
  current_zone_id: number | null;
};

export function useFishingInventory() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
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
        current_zone_id: json.current_zone_id ?? json.currentZoneId ?? null,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { data, loading, error, refetch: fetchInventory };
}
