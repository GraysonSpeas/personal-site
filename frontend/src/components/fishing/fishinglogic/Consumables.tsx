import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config';

export function Consumables({ refetch, refreshTrigger }: { refetch: () => void; refreshTrigger?: number }) {
  const [active, setActive] = useState<
    { typeId: number; name: string; effect: string; timeRemaining: number }[]
  >([]);
  const [owned, setOwned] = useState<{ typeId: number; name: string; quantity: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // New states for rain
  const [isRaining, setIsRaining] = useState(false);
  const [rainTimeRemaining, setRainTimeRemaining] = useState(0);

const fetchActive = async () => {
  const res = await fetch(`${API_BASE}/consumables/active`, {
    credentials: 'include',
  });
  const data = await res.json();

  const consumables = (data.consumables || []).map((c: {
    type_id: number;
    name: string;
    effect: string;
    timeRemaining?: number;
    time_remaining?: number;
  }) => ({
    typeId: c.type_id,
    name: c.name,
    effect: c.effect,
    timeRemaining: c.timeRemaining ?? c.time_remaining ?? 0,
  }));

  setActive(consumables.filter((c: { timeRemaining: number }) => c.timeRemaining > 0));
};


  const fetchOwned = async () => {
    const res = await fetch(`${API_BASE}/consumables/owned`, {
      credentials: 'include',
    });
    const data = await res.json();
    setOwned(
      (data.consumables || []).map((c: any) => ({
        typeId: c.type_id,
        name: c.name,
        quantity: c.quantity,
      }))
    );
  };

  // New fetch for weather/rain info
const fetchWeather = async () => {
  const res = await fetch(`${API_BASE}/timecontent`, {
    credentials: 'include',
  });
  const data = await res.json();
  console.log('Weather data from API:', data);  // <-- add this line
  setIsRaining(data.worldState?.isRaining || false);
  setRainTimeRemaining(data.worldState?.rainTimeRemaining ?? 0);
};

  useEffect(() => {
    fetchActive();
    fetchOwned();
    fetchWeather();
  }, []);
useEffect(() => {
  if (refreshTrigger !== undefined) {
    fetchActive();
    fetchOwned();
    fetchWeather();
  }
}, [refreshTrigger]);

  // Tick countdown for active consumables
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((curr) =>
        curr
          .map((c) => ({ ...c, timeRemaining: Math.max(c.timeRemaining - 1, 0) }))
          .filter((c) => c.timeRemaining > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tick countdown for rain
  useEffect(() => {
    if (!isRaining) return;
    const rainTimer = setInterval(() => {
      setRainTimeRemaining((time) => Math.max(time - 1, 0));
    }, 1000);
    return () => clearInterval(rainTimer);
  }, [isRaining]);

  const handleUse = async () => {
    if (selected == null) return;
    setLoading(true);
    setMessage('');
    const res = await fetch(`${API_BASE}/consumables/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ typeId: selected }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Consumable used!');
      await fetchActive();
      await fetchOwned();
      refetch();
    } else {
      setMessage(data.error || 'Failed to use consumable.');
    }
    setLoading(false);
  };

  const handleCancel = async (typeId: number) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/consumables/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ typeId }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Effect cancelled.');
      await fetchActive();
      await fetchOwned();
      refetch();
    } else {
      setMessage(data.error || 'Failed to cancel effect.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Active Consumables</h2>

      {active.length === 0 && <p className="text-black mb-4">No active consumables.</p>}

      {active.map((c) => (
        <div key={c.typeId} className="mb-2 p-2 border rounded bg-gray-100">
          <p className="text-black font-semibold">{c.name}</p>
          <p className="text-black text-sm">{c.effect}</p>
          <p className="text-black text-sm">
            Time remaining: {Math.floor(c.timeRemaining / 60)}:
            {(c.timeRemaining % 60).toString().padStart(2, '0')}
          </p>
          <button
            className="mt-1 text-red-500 underline text-sm"
            onClick={() => handleCancel(c.typeId)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      ))}

      {/* Rain Display */}
      {isRaining && (
        <div className="mt-4 p-3 bg-blue-200 rounded text-blue-900 font-semibold">
          Raining — Luck +20%, Bait +5%<br />
          Time remaining: {Math.floor(rainTimeRemaining / 60)}:
          {(rainTimeRemaining % 60).toString().padStart(2, '0')}
        </div>
      )}

      <h3 className="text-lg font-medium mt-6 mb-2 text-black">Use New Consumable</h3>
      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring text-black"
        value={selected ?? ''}
        onChange={(e) => setSelected(e.target.value === '' ? null : Number(e.target.value))}
      >
        <option value="">Select consumable</option>
        {owned
          .filter((c) => c.quantity > 0)
          .map((c) => (
            <option key={c.typeId} value={c.typeId} className="text-black">
              {c.name} (Qty: {c.quantity})
            </option>
          ))}
      </select>

      <button
        onClick={handleUse}
        disabled={loading || selected == null}
        className={`w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Using...' : 'Use Consumable'}
      </button>

      {message && <p className="mt-4 text-center text-sm font-medium text-black">{message}</p>}
    </div>
  );
}