import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../config.tsx';

export function GearSelector({ gear, bait, refetch }: { gear: any[], bait: any[], refetch: () => void }) {
  const [selectedRod, setSelectedRod] = useState<number | null>(null);
  const [selectedHook, setSelectedHook] = useState<number | null>(null);
  const [selectedBait, setSelectedBait] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract equipped gear IDs
  const equippedRod = gear.find(g => g.type === 'rod' && g.equipped);
  const equippedHook = gear.find(g => g.type === 'hook' && g.equipped);
  const equippedBait = bait.find(b => b.equipped);

  // On mount or gear/bait change, preselect equipped gear if any
  useEffect(() => {
    setSelectedRod(equippedRod?.gear_id ?? null);
    setSelectedHook(equippedHook?.gear_id ?? null);
    setSelectedBait(equippedBait?.bait_id ?? null);
  }, [gear, bait, equippedRod, equippedHook, equippedBait]);

  const handleEquip = async () => {
    // No need to require all selected; null means unequip
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gear/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rodId: selectedRod,
          hookId: selectedHook,
          baitId: selectedBait,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Gear equipped successfully!');
        refetch();
      } else {
        setMessage(data.error || 'Failed to equip gear.');
      }
    } catch (error) {
      console.error('Equip gear error:', error);
      setMessage('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Select Gear to Equip</h2>

      <div className="mb-4 p-2 border rounded bg-gray-100">
        <p className="font-semibold text-black">Currently Equipped:</p>
        <p className="text-black">Rod: {equippedRod ? equippedRod.name : 'Empty'}</p>
        <p className="text-black">Hook: {equippedHook ? equippedHook.name : 'Empty'}</p>
        <p className="text-black">
          Bait: {equippedBait ? `${equippedBait.bait_type} (Qty: ${equippedBait.quantity})` : 'Empty'}
        </p>
      </div>

      <label className="block mb-2 text-black font-medium">Rod</label>
      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={e => setSelectedRod(e.target.value === '' ? null : Number(e.target.value))}
        value={selectedRod ?? ''}
      >
        <option value="">None</option>
        {gear.filter(g => g.type === 'rod').map(r => (
          <option key={r.gear_id} value={r.gear_id} className="text-black">
            {r.name} {r.equipped ? '(Equipped)' : ''}
          </option>
        ))}
      </select>

      <label className="block mb-2 text-black font-medium">Hook</label>
      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={e => setSelectedHook(e.target.value === '' ? null : Number(e.target.value))}
        value={selectedHook ?? ''}
      >
        <option value="">None</option>
        {gear.filter(g => g.type === 'hook').map(h => (
          <option key={h.gear_id} value={h.gear_id} className="text-black">
            {h.name} {h.equipped ? '(Equipped)' : ''}
          </option>
        ))}
      </select>

      <label className="block mb-2 text-black font-medium">Bait</label>
      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={e => setSelectedBait(e.target.value === '' ? null : Number(e.target.value))}
        value={selectedBait ?? ''}
      >
        <option value="">None</option>
        {bait.map(b => (
          <option key={b.bait_id} value={b.bait_id} className="text-black">
            {b.bait_type} (Qty: {b.quantity}) {b.equipped ? '(Equipped)' : ''}
          </option>
        ))}
      </select>

      <button
        className={`w-full p-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleEquip}
        disabled={loading}
      >
        {loading ? 'Equipping...' : 'Equip Selected Gear'}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-black">{message}</p>
      )}
    </div>
  );
}
