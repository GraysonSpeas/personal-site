import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../config.tsx';

type Fish = {
  id: number;
  species: string;
  rarity: string;
  weight: number;
  length: number;
  modifier: string | null;
  quantity: number;
  sell_price: number;
};

type Bait = {
  id: number;
  type_id: number;
  quantity: number;
  sell_price: number;
  name: string;
};

type Resource = {
  id: number;
  name: string;
  rarity: string;
  quantity: number;
  sell_price: number;
};

type CatchOfTheDayFish = {
  species: string;
  rarity: string;
  sellLimit: number;
  sellAmount: number;
  remaining: number;
  multiplier: number;
};

type MerchantProps = {
  refetch: () => Promise<void>;
  refetchTrigger?: number;
  refreshOther: () => void;
};

// List of buyable items (hardcoded)
const BUYABLE_ITEMS = [
  { id: 'broken-bait', name: 'Broken Bait', price: 50 },
  { id: 'heat-resistant-rod', name: 'Heat Resistant Rod', price: 50 },
  { id: 'heat-resistant-hook', name: 'Heat Resistant Hook', price: 50 },
  { id: 'heat-resistant-bait', name: 'Heat Resistant Bait', price: 50 },
  { id: 'blue-bull', name: 'Blue Bull Consumable', price: 150 },
  { id: 'merchant-resource', name: 'Merchant Resource', price: 50 },
  { id: 'simple-seed', name: 'Simple Seed', price: 100 },
  { id: 'cold-seed', name: 'Cold Seed', price: 150 },
  { id: 'heat-seed', name: 'Heat Seed', price: 200 },
  { id: 'rare-bait-seed', name: 'Rare Bait Seed', price: 500 },
  { id: 'mystery-seed', name: 'Mystery Seed', price: 750 },
];

export function Merchant({ refetch, refetchTrigger, refreshOther }: MerchantProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [fish, setFish] = useState<Fish[]>([]);
  const [bait, setBait] = useState<Bait[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [gold, setGold] = useState(0);
  const [buySelections, setBuySelections] = useState<Record<string, number>>({});
  const [sellSelections, setSellSelections] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [catchOfTheDay, setCatchOfTheDay] = useState<CatchOfTheDayFish[]>([]);

  useEffect(() => {
    fetchInventory();
  }, [refetchTrigger]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/merchant/inventory`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch inventory');

      setFish(data.fish);
      setBait(data.bait);
      setResources(data.resources || []);
      setGold(data.gold);
      setCatchOfTheDay(data.catchOfTheDay || []);
      setMessage('');
    } catch (e: any) {
      setMessage(e.message || 'Error fetching inventory');
    }
    setLoading(false);
  };

  function clampQty(q: number) {
    return q < 1 ? 1 : q;
  }

  // SELL helpers
  function getFishCatchLimit(species: string): number | null {
    const entry = catchOfTheDay.find((c) => c.species === species);
    return entry ? entry.sellLimit : null;
  }

  function adjustSellQty(key: string, delta: number, max: number, species?: string) {
    setSellSelections((prev) => {
      const cur = prev[key] ?? 0;
      let next = cur + delta;
      if (next < 0) next = 0;
      if (species) {
        const catchLimit = getFishCatchLimit(species);
        if (catchLimit !== null && next > catchLimit) next = catchLimit;
      }
      if (next > max) next = max;
      return { ...prev, [key]: next };
    });
  }

  // BUY helpers
  function adjustBuyQty(key: string, delta: number) {
  setBuySelections((prev) => {
    const cur = prev[key] ?? 0;
    let next = cur + delta;
    if (next < 0) next = 0; // allow 0
    return { ...prev, [key]: next };
  });
}

  // Calculate total buy cost
  function getBuyTotal() {
    let total = 0;
    for (const key in buySelections) {
      const qty = buySelections[key];
      const item = BUYABLE_ITEMS.find((i) => i.id === key);
      if (item && qty > 0) total += item.price * qty;
    }
    return total;
  }

  async function handleBuy() {
    const totalCost = getBuyTotal();
    if (totalCost > gold) {
      setMessage('Not enough gold.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // For simplicity send entire buySelections object to API
const ITEM_MAPPING: Record<string, { itemType: string; typeId: number }> = {
  'broken-bait': { itemType: 'bait', typeId: 1 },
  'heat-resistant-rod': { itemType: 'rod', typeId: 4 },
  'heat-resistant-hook': { itemType: 'hook', typeId: 4 },
  'heat-resistant-bait': { itemType: 'bait', typeId: 4 },
  'blue-bull': { itemType: 'consumable', typeId: 1 },
  'merchant-resource': { itemType: 'resource', typeId: 38 },
  'simple-seed': { itemType: 'seed', typeId: 1 },
  'cold-seed': { itemType: 'seed', typeId: 2 },
  'heat-seed': { itemType: 'seed', typeId: 3 },
  'rare-bait-seed': { itemType: 'seed', typeId: 4 },
  'mystery-seed': { itemType: 'seed', typeId: 5 },
};

const itemsToBuy = Object.entries(buySelections)
  .filter(([_, qty]) => qty > 0)
  .map(([key, qty]) => {
    const { itemType, typeId } = ITEM_MAPPING[key];
    return { itemType, typeId, quantity: qty };
  });

const res = await fetch(`${API_BASE}/merchant/buy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ items: itemsToBuy }),
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Buy failed');
      setMessage(`Bought items successfully!`);
      setBuySelections({});
      await refetch();
      refreshOther();
      await fetchInventory();
    } catch (e: any) {
      setMessage(e.message || 'Error buying items');
    }
    setLoading(false);
  }

  async function handleSell() {
    setLoading(true);
    setMessage('');
    try {
      for (const key in sellSelections) {
        const qty = sellSelections[key];
        if (qty <= 0) continue;
        const [itemType, idStr] = key.split('-');
        const itemId = Number(idStr);
        const res = await fetch(`${API_BASE}/merchant/sell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemType, itemId, quantity: qty }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sell failed');
      }
      setMessage('Items sold successfully!');
      setSellSelections({});
      await refetch();
      refreshOther();
      await fetchInventory();
    } catch (e: any) {
      setMessage(e.message || 'Error selling items');
    }
    setLoading(false);
  }

  function getSellTotal() {
    let total = 0;
    for (const key in sellSelections) {
      const qty = sellSelections[key];
      if (qty <= 0) continue;
      const [itemType, idStr] = key.split('-');
      const id = Number(idStr);

      if (itemType === 'bait') {
        const item = bait.find((b) => b.id === id);
        if (item) total += item.sell_price * qty;
      } else if (itemType === 'fish') {
        const item = fish.find((f) => f.id === id);
        if (item) {
          const catchEntry = catchOfTheDay.find(c => c.species === item.species);
          if (!catchEntry) {
            total += item.sell_price * qty;
          } else {
            const bonusQty = Math.min(qty, catchEntry.remaining);
            const baseQty = qty - bonusQty;
            total += baseQty * item.sell_price + bonusQty * item.sell_price * catchEntry.multiplier;
          }
        }
      } else if (itemType === 'resource') {
        const item = resources.find((r) => r.id === id);
        if (item) total += item.sell_price * qty;
      }
    }
    return Math.round(total);
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow-lg text-black">
      <h2 className="text-2xl font-bold mb-4">Merchant</h2>
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setTab('buy')}
          className={`px-4 py-2 rounded ${tab === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          disabled={loading}
        >
          Buy
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`px-4 py-2 rounded ${tab === 'sell' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          disabled={loading}
        >
          Sell
        </button>
      </div>
      <p className="mb-4 font-semibold">Gold: {gold}</p>

      {tab === 'buy' && (
        <div>
          <h3 className="mb-2 font-semibold">Buy Items</h3>
          {BUYABLE_ITEMS.map((item) => {
            const qty = buySelections[item.id] ?? 0;
            const canAfford = qty * item.price <= gold;
            return (
              <div key={item.id} className="flex items-center justify-between mb-3">
                <div>{item.name} ({item.price} gold each)</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustBuyQty(item.id, -10)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">-10</button>
                  <button onClick={() => adjustBuyQty(item.id, -1)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">-1</button>
                  <input
                    type="number"
                    min={0}
                    readOnly
                    value={qty}
                    className="w-16 text-center border rounded"
                  />
                  <button onClick={() => adjustBuyQty(item.id, 1)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">+1</button>
                  <button onClick={() => adjustBuyQty(item.id, 10)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">+10</button>
                </div>
              </div>
            );
          })}
          <button
            onClick={handleBuy}
            disabled={loading || getBuyTotal() === 0 || getBuyTotal() > gold}
            className={`w-full py-2 rounded ${
              getBuyTotal() > 0 && getBuyTotal() <= gold
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 cursor-not-allowed text-white opacity-50'
            }`}
          >
            {loading ? 'Buying...' : `Buy Selected Items for ${getBuyTotal()} gold`}
          </button>
        </div>
      )}

      {tab === 'sell' && (
        <div>
          <h3 className="mb-2 font-semibold">Sell Fish and Bait</h3>

          {/* Fish Section */}
          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-2">
            <p className="font-semibold mb-1">Fish</p>
            {catchOfTheDay.length > 0 && (
              <div className="mb-4 p-2 border rounded bg-gray-100 text-black">
                <h3 className="font-bold mb-2">Catch of the Day</h3>
                <ul>
                  {catchOfTheDay.map(({ species, rarity, sellLimit, sellAmount }) => (
                    <li key={species} className="text-sm mb-1">
                      <strong>{species}</strong> — {rarity} <br /> Limit: {sellLimit}, Sold: {sellAmount}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fish.length === 0 && <p className="italic">No fish to sell.</p>}
            {fish.map((f) => {
              const key = `fish-${f.id}`;
              const maxQty = f.quantity;
              const selectedQty = sellSelections[key] ?? 0;
              const catchLimit = getFishCatchLimit(f.species);
              const maxSellAllowed = catchLimit !== null ? Math.min(maxQty, catchLimit) : maxQty;
              return (
                <div key={key} className="flex flex-col mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      {f.species} (Qty: {f.quantity}) <br /> {f.rarity} <br /> {f.sell_price} gold
                      {catchLimit !== null && catchOfTheDay.find(c => c.species === f.species)?.remaining! > 0 ? (
                        <span className="ml-2 text-sm text-green-600">
                          Catch of the Day Limit Left: {catchOfTheDay.find(c => c.species === f.species)?.remaining}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustSellQty(key, -10, maxSellAllowed, f.species)} disabled={loading} className="px-1 bg-gray-300 rounded">-10</button>
                      <button onClick={() => adjustSellQty(key, -1, maxSellAllowed, f.species)} disabled={loading} className="px-1 bg-gray-300 rounded">-1</button>
                      <input type="number" readOnly value={selectedQty} className="w-12 text-center border rounded" />
                      <button onClick={() => adjustSellQty(key, 1, maxSellAllowed, f.species)} disabled={loading} className="px-1 bg-gray-300 rounded">+1</button>
                      <button onClick={() => adjustSellQty(key, 10, maxSellAllowed, f.species)} disabled={loading} className="px-1 bg-gray-300 rounded">+10</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bait Section */}
          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-2">
            <p className="font-semibold mb-1">Bait</p>
            {bait.length === 0 && <p className="italic">No bait to sell.</p>}
            {bait.map((b) => {
              const key = `bait-${b.id}`;
              const maxQty = b.quantity;
              const selectedQty = sellSelections[key] ?? 0;
              return (
                <div key={key} className="flex flex-col mb-2">
                  <div className="flex items-center justify-between">
                    <div>{b.name} (Qty: {b.quantity})</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustSellQty(key, -10, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">-10</button>
                      <button onClick={() => adjustSellQty(key, -1, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">-1</button>
                      <input type="number" readOnly value={selectedQty} className="w-12 text-center border rounded" />
                      <button onClick={() => adjustSellQty(key, 1, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">+1</button>
                      <button onClick={() => adjustSellQty(key, 10, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">+10</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resources Section */}
          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-2">
            <p className="font-semibold mb-1">Resources</p>
            {resources.length === 0 && <p className="italic">No resources to sell.</p>}
            {resources.map((r) => {
              const key = `resource-${r.id}`;
              const maxQty = r.quantity;
              const selectedQty = sellSelections[key] ?? 0;
              return (
                <div key={key} className="flex flex-col mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      {r.name} (Qty: {r.quantity}) <br />{r.rarity} <br />{r.sell_price} gold
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustSellQty(key, -10, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">-10</button>
                      <button onClick={() => adjustSellQty(key, -1, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">-1</button>
                      <input type="number" readOnly value={selectedQty} className="w-12 text-center border rounded" />
                      <button onClick={() => adjustSellQty(key, 1, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">+1</button>
                      <button onClick={() => adjustSellQty(key, 10, maxQty)} disabled={loading} className="px-1 bg-gray-300 rounded">+10</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSell}
            disabled={loading || Object.values(sellSelections).every((v) => v <= 0)}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Selling...' : `Sell Selected Items for ${getSellTotal()} gold`}
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-center font-medium text-black">{message}</p>}
    </div>
  );
}