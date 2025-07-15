import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../config.tsx';

const BROKEN_BAIT_NAME = 'broken bait';
const BROKEN_BAIT_BUY_PRICE = 100;

type Fish = {
  id: number;
  species: string;
  rarity: string;
  weight: number;
  length: number;
  modifier: string | null;
  quantity: number;
};

type Bait = {
  id: number;
  type_id: number;
  quantity: number;
  sell_price: number;
  name: string;
};

type MerchantProps = {
  refetchInventory: () => Promise<void>;
};

export function Merchant({ refetchInventory }: MerchantProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [fish, setFish] = useState<Fish[]>([]);
  const [bait, setBait] = useState<Bait[]>([]);
  const [gold, setGold] = useState(0);
  const [buyQty, setBuyQty] = useState(1);
  const [sellSelections, setSellSelections] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const totalCost = buyQty * BROKEN_BAIT_BUY_PRICE;
  const canAfford = totalCost <= gold;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/merchant/inventory`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch inventory');
      setFish(data.fish);
      setBait(data.bait);
      setGold(data.gold);
      setMessage('');
    } catch (e: any) {
      setMessage(e.message || 'Error fetching inventory');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  function clampQty(q: number) {
    return q < 1 ? 1 : q;
  }
  function adjustSellQty(key: string, delta: number, max: number) {
    setSellSelections((prev) => {
      const cur = prev[key] ?? 0;
      let next = cur + delta;
      if (next < 0) next = 0;
      if (next > max) next = max;
      return { ...prev, [key]: next };
    });
  }
  function adjustBuyQty(delta: number) {
    setBuyQty((q) => {
      let next = q + delta;
      if (next < 1) next = 1;
      return next;
    });
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
      await refetchInventory();
      await fetchInventory();
    } catch (e: any) {
      setMessage(e.message || 'Error selling items');
    }
    setLoading(false);
  }

  async function handleBuy() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/merchant/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: buyQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Buy failed');
      setMessage(`Bought ${buyQty} broken bait!`);
      setBuyQty(1);
      await refetchInventory();
      await fetchInventory();
    } catch (e: any) {
      setMessage(e.message || 'Error buying broken bait');
    }
    setLoading(false);
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
          <h3 className="mb-2 font-semibold">Buy Broken Bait (100 gold each)</h3>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => adjustBuyQty(-10)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">
              -10
            </button>
            <button onClick={() => adjustBuyQty(-1)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">
              -1
            </button>
            <input type="number" min={1} value={buyQty} readOnly className="w-16 text-center border rounded" />
            <button onClick={() => adjustBuyQty(1)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">
              +1
            </button>
            <button onClick={() => adjustBuyQty(10)} disabled={loading} className="px-2 py-1 bg-gray-300 rounded">
              +10
            </button>
          </div>
          <button
            onClick={handleBuy}
            disabled={loading || !canAfford}
            className={`w-full py-2 rounded ${
              canAfford ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 cursor-not-allowed text-white'
            }`}
          >
            {loading ? 'Buying...' : `Buy ${buyQty} Broken Bait for ${totalCost} gold`}
          </button>
        </div>
      )}

      {tab === 'sell' && (
        <div>
          <h3 className="mb-2 font-semibold">Sell Fish and Bait</h3>

          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-2">
            <p className="font-semibold mb-1">Fish</p>
            {fish.length === 0 && <p className="italic">No fish to sell.</p>}
            {fish.map((f) => {
              const key = `fish-${f.id}`;
              const maxQty = f.quantity;
              const selectedQty = sellSelections[key] ?? 0;
              return (
                <div key={key} className="flex items-center justify-between mb-1">
                  <div>
                    {f.species} (Qty: {f.quantity}) - {f.rarity}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustSellQty(key, -10, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => adjustSellQty(key, -1, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      -1
                    </button>
                    <input type="number" readOnly value={selectedQty} className="w-12 text-center border rounded" />
                    <button
                      onClick={() => adjustSellQty(key, 1, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustSellQty(key, 10, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-2">
            <p className="font-semibold mb-1">Bait</p>
            {bait.length === 0 && <p className="italic">No bait to sell.</p>}
            {bait.map((b) => {
              const key = `bait-${b.id}`;
              const maxQty = b.quantity;
              const selectedQty = sellSelections[key] ?? 0;
              return (
                <div key={key} className="flex items-center justify-between mb-1">
                  <div>
                    {b.name} (Qty: {b.quantity})
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustSellQty(key, -10, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => adjustSellQty(key, -1, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      -1
                    </button>
                    <input type="number" readOnly value={selectedQty} className="w-12 text-center border rounded" />
                    <button
                      onClick={() => adjustSellQty(key, 1, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustSellQty(key, 10, maxQty)}
                      disabled={loading}
                      className="px-1 bg-gray-300 rounded"
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSell}
            disabled={loading || Object.values(sellSelections).every((v) => v <= 0)}
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Selling...' : 'Sell Selected Items'}
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-center font-medium text-black">{message}</p>}
    </div>
  );
}