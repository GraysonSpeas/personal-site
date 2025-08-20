import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config';

interface PlanterSlot {
  slotIndex: number;
  timeRemaining: number;
  hasPlantedSeed: boolean;
  level?: number;
  plantedId?: number;
  nextUpgradeCost?: number | null;
  seedTypeId?: number;
}

interface SeedType {
  id: number;
  name: string;
  emoji?: string;
}

interface HarvestedItem {
  type: string;
  name: string;
  quantity: number;
}

const SLOT_PRICES = [0, 5000, 10000, 20000];
const MAX_SLOTS = 4;

export function Planters({ refreshTrigger }: { refreshTrigger?: number }) {
  const [slots, setSlots] = useState<PlanterSlot[]>([]);
  const [seedTypes, setSeedTypes] = useState<SeedType[]>([]);
  const [inventory, setInventory] = useState<{ [key: number]: number }>({});
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gold, setGold] = useState<number>(0);
  const [harvested, setHarvested] = useState<HarvestedItem[]>([]);

  const fetchSlots = async () => {
    const res = await fetch(`${API_BASE}/planters/slots`, { credentials: 'include' });
    const data = await res.json();
    setSlots(Array.isArray(data.slots) ? data.slots : []);
  };

  const fetchSeedTypes = async () => {
    const res = await fetch(`${API_BASE}/planters/types`, { credentials: 'include' });
    const data = await res.json();
    const typesWithEmoji = (data.seedTypes || []).map((t: any) => ({
      ...t,
      emoji: t.name.toLowerCase().includes('cold') ? '🧊' : '🌱',
    }));
    setSeedTypes(typesWithEmoji);
  };

  const fetchInventory = async () => {
    const res = await fetch(`${API_BASE}/inventory`, { credentials: 'include' });
    const data = await res.json();
    setGold(data.currency?.gold ?? 0);

    const seedsMap: { [key: number]: number } = {};
    (data.seeds || []).forEach((s: any) => {
      seedsMap[s.seed_type_id] = s.quantity;
    });
    setInventory(seedsMap);
  };

  useEffect(() => {
    fetchSlots();
    fetchSeedTypes();
    fetchInventory();
  }, []);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchSlots();
      fetchSeedTypes();
      fetchInventory();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots(prev =>
        prev.map(s => {
          if (!s.hasPlantedSeed) return s;
          const time = Math.max(s.timeRemaining - 1, 0);
          return { ...s, timeRemaining: time };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async (slotIndex: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/purchase`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setMessage(data.success ? `Purchased slot ${slotIndex + 1}!` : data.error || 'Failed to purchase slot.');
    await fetchSlots();
    await fetchInventory();
    setLoading(false);
  };

  const handleUpgrade = async (slotIndex: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/${slotIndex}/upgrade`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setMessage(data.success ? `Upgraded slot ${slotIndex + 1} to level ${data.newLevel}!` : data.error || 'Failed to upgrade slot.');
    await fetchSlots();
    await fetchInventory();
    setLoading(false);
  };

  const handlePlant = async () => {
    if (selectedSlot == null || selectedSeed == null) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/${selectedSlot}/plant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ seedTypeId: selectedSeed }),
    });
    const data = await res.json();
    setMessage(data.success ? `Planted! Ready at ${new Date(data.readyAt).toLocaleTimeString()}` : data.error || 'Failed to plant.');
    setSelectedSlot(null);
    setSelectedSeed(null);
    await fetchSlots();
    await fetchInventory();
    setLoading(false);
  };

const handleHarvest = async (plantedId: number) => {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/planters/slots/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plantedId }),
    });
    const data: {
      success?: boolean;
      error?: string;
      outputs?: { type: string; typeId: number; quantity: number }[];
    } = await res.json();

    if (data.success) {
      const items: HarvestedItem[] = (data.outputs || []).map((i) => ({
        type: i.type,
        typeId: i.typeId,
        quantity: i.quantity,
        name: getSeedName(i.typeId),
      }));
      const msg = items.map((i) => `${i.quantity}x ${i.name} (${i.type})`).join(', ');
      setMessage(`Harvested: ${msg}`);
      setHarvested(items);
    } else {
      setMessage(data.error || 'Failed to harvest.');
    }

    await fetchSlots();
    await fetchInventory();
  } catch (err) {
    setMessage('Error harvesting.');
  } finally {
    setLoading(false);
  }
};

  const getSeedName = (seedTypeId?: number) => {
    const seed = seedTypes.find(s => s.id === seedTypeId);
    return seed ? `${seed.name} ${seed.emoji ?? '🌱'}` : '';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Planter Slots</h2>
      <p className="mb-2 text-sm text-black">Gold: {gold}</p>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {Array.from({ length: MAX_SLOTS }).map((_, i) => {
          const slot = slots.find(s => s.slotIndex === i);
          if (slot) {
            return (
              <div
                key={i}
                className={`p-4 border rounded text-center cursor-pointer ${slot.hasPlantedSeed ? 'bg-green-200' : 'bg-orange-200'}`}
              >
                Slot {slot.slotIndex + 1} {slot.level ? `(Lv ${slot.level})` : ''}

                {slot.hasPlantedSeed && (
                  <>
                    <div>{slot.timeRemaining > 0 ? `${slot.timeRemaining}s left` : '🌟 Ready!'}</div>
                    <div>{getSeedName(slot.seedTypeId)}</div>
                    {slot.timeRemaining === 0 && slot.plantedId && (
                      <button
                        className="mt-1 p-1 rounded text-sm bg-green-400"
                        onClick={() => handleHarvest(slot.plantedId!)}
                        disabled={loading}
                      >
                        Harvest
                      </button>
                    )}
                  </>
                )}

                {!slot.hasPlantedSeed && (
                  <>
                    <select
                      className="w-full p-1 mt-1 border rounded text-black"
                      value={selectedSeed && selectedSlot === slot.slotIndex ? selectedSeed : ''}
                      onChange={e => {
                        setSelectedSlot(slot.slotIndex);
                        setSelectedSeed(Number(e.target.value));
                      }}
                    >
                      <option value="">Select seed</option>
                      {seedTypes.filter(t => (inventory[t.id] ?? 0) > 0).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({inventory[t.id]})
                        </option>
                      ))}
                    </select>
                    <button
                      className="w-full p-1 mt-1 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={loading || selectedSeed == null || selectedSlot !== slot.slotIndex}
                      onClick={handlePlant}
                    >
                      {loading ? 'Planting...' : 'Plant'}
                    </button>
                  </>
                )}

                <button
                  className="mt-1 p-1 bg-blue-400 rounded text-sm"
                  onClick={() => handleUpgrade(slot.slotIndex)}
                  disabled={loading || slot.nextUpgradeCost == null || gold < slot.nextUpgradeCost}
                >
                  Upgrade ({slot.nextUpgradeCost ?? '-'})
                </button>
              </div>
            );
          } else {
            const price = SLOT_PRICES[i];
            return (
              <div key={i} className="p-4 border rounded text-center bg-gray-200">
                Slot {i + 1}
                <button
                  className={`mt-2 w-full p-2 rounded text-white ${gold >= price ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500'}`}
                  onClick={() => handlePurchase(i)}
                  disabled={loading || gold < price}
                >
                  Purchase ({price}g)
                </button>
              </div>
            );
          }
        })}
      </div>

      {harvested.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Harvested Items:</h3>
          <ul className="text-sm">
            {harvested.map((item, idx) => (
              <li key={idx}>
                {item.quantity}x {item.name} ({item.type})
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="mt-4 text-center text-sm text-black">{message}</p>}
    </div>
  );
}