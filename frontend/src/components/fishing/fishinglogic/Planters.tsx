import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config';

interface PlanterSlot {
  slotIndex: number;
  timeRemaining: number;
  hasPlantedSeed: boolean;
  level?: number;
  plantedId?: number;
  nextUpgradeCost?: number | null;
}

interface SeedType {
  id: number;
  name: string;
}

const SLOT_PRICES = [0, 100, 200, 1000, 10000, 20000, 40000, 60000];
const MAX_SLOTS = 8;

export function Planters({ refreshTrigger }: { refreshTrigger?: number }) {
  const [slots, setSlots] = useState<PlanterSlot[]>([]);
  const [seedTypes, setSeedTypes] = useState<SeedType[]>([]);
  const [inventory, setInventory] = useState<{ [key: number]: number }>({});
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gold, setGold] = useState<number>(0);

  const fetchSlots = async () => {
    const res = await fetch(`${API_BASE}/planters/slots`, { credentials: 'include' });
    const data = await res.json();
    setSlots(Array.isArray(data.slots) ? data.slots : []);
    setGold(data.gold ?? 0);
  };

  const fetchSeedTypes = async () => {
    const res = await fetch(`${API_BASE}/planters/types`, { credentials: 'include' });
    const data = await res.json();
    setSeedTypes(Array.isArray(data.seedTypes) ? data.seedTypes : []);
  };

  const fetchInventory = async () => {
    const res = await fetch(`${API_BASE}/planters/inventory`, { credentials: 'include' });
    const data = await res.json();
    setInventory(data.seeds || {});
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

  // Live countdown for slots
  useEffect(() => {
    const interval = setInterval(() => {
      setSlots(prev =>
        prev.map(s => {
          if (!s.hasPlantedSeed) return s;
          return { ...s, timeRemaining: Math.max(s.timeRemaining - 1, 0) };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async (slotIndex: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/purchase`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) setMessage(`Purchased slot ${slotIndex + 1}!`);
    else setMessage(data.error || 'Failed to purchase slot.');
    setLoading(false);
    fetchSlots();
  };

  const handleUpgrade = async (slotIndex: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/${slotIndex}/upgrade`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) setMessage(`Upgraded slot ${slotIndex + 1} to level ${data.newLevel}!`);
    else setMessage(data.error || 'Failed to upgrade slot.');
    setLoading(false);
    fetchSlots();
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
    if (data.success) setMessage(`Planted! Ready at ${new Date(data.readyAt).toLocaleTimeString()}`);
    else setMessage(data.error || 'Failed to plant.');
    setLoading(false);
    setSelectedSlot(null);
    setSelectedSeed(null);
    fetchSlots();
    fetchInventory();
  };

  const handleHarvest = async (slotIndex: number, plantedId: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/planters/slots/${slotIndex}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plantedId }),
    });
    const data = await res.json();
    if (data.success) setMessage('Harvested!');
    else setMessage(data.error || 'Failed to harvest.');
    setLoading(false);
    fetchSlots();
    fetchInventory();
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
                className={`p-4 border rounded text-center cursor-pointer ${
                  slot.hasPlantedSeed ? 'bg-green-200' : 'bg-orange-200'
                }`}
                onClick={() => !slot.hasPlantedSeed && setSelectedSlot(slot.slotIndex)}
              >
                Slot {slot.slotIndex + 1}
                {slot.hasPlantedSeed && (
                  <>
                    <div>🌱 {slot.timeRemaining}s left</div>
                    <button
                      className={`mt-1 p-1 rounded text-sm ${
                        slot.timeRemaining > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-400'
                      }`}
                      onClick={() => slot.plantedId && handleHarvest(slot.slotIndex, slot.plantedId)}
                      disabled={loading || slot.timeRemaining > 0}
                    >
                      Harvest
                    </button>
                    <button
                      className="mt-1 ml-1 p-1 bg-blue-400 rounded text-sm"
                      onClick={() => handleUpgrade(slot.slotIndex)}
                      disabled={loading || slot.nextUpgradeCost == null || gold < slot.nextUpgradeCost}
                    >
                      Upgrade ({slot.nextUpgradeCost ?? '-'})
                    </button>
                  </>
                )}
              </div>
            );
          } else {
            const price = SLOT_PRICES[i];
            return (
              <div key={i} className="p-4 border rounded text-center bg-gray-200">
                Slot {i + 1}
                <button
                  className={`mt-2 w-full p-2 rounded text-white ${
                    gold >= price ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500'
                  }`}
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

      {selectedSlot != null && (
        <>
          <h3 className="text-lg font-medium mb-2 text-black">Select Seed to Plant</h3>
          <select
            className="w-full p-2 mb-2 border rounded text-black"
            value={selectedSeed ?? ''}
            onChange={e => setSelectedSeed(Number(e.target.value))}
          >
            <option value="">Select seed</option>
            {seedTypes
              .filter(t => (inventory[t.id] ?? 0) > 0) // only show seeds owned
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({inventory[t.id] ?? 0})
                </option>
              ))}
          </select>
          <button
            onClick={handlePlant}
            disabled={loading || selectedSeed == null}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {loading ? 'Planting...' : 'Plant'}
          </button>
        </>
      )}

      {message && <p className="mt-4 text-center text-sm text-black">{message}</p>}
    </div>
  );
}