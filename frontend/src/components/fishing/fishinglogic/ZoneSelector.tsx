import React, { useState } from 'react';
import { API_BASE } from '../../../config.tsx';

const zoneTypes = [
  { id: 1, name: 'Jungle', className: 'bg-yellow-900 bg-opacity-80' },
  { id: 2, name: 'Ocean', className: 'bg-blue-600 bg-opacity-80' },
  { id: 3, name: 'River', className: 'bg-green-600 bg-opacity-80' },
  { id: 4, name: 'Lava', className: 'bg-red-600 bg-opacity-80' },
];

export function ZoneSelector({
  refetch,
  currentZoneId,
}: {
  refetch: () => void;
  currentZoneId: number | null;
}) {
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    if (!zoneId) return setMessage('Please select a zone.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/zone/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Zone updated successfully!');
        refetch?.();
      } else {
        setMessage(data.error || 'Failed to update the zone.');
      }
    } catch (error) {
      console.error('Zone update error:', error);
      setMessage('Network error. Please try again.');
    }
    setLoading(false);
  };

  const currentZone = zoneTypes.find(z => z.id === currentZoneId);

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Select a Zone</h2>

      {currentZone && (
        <div className={`p-2 rounded text-white text-center mb-4 ${currentZone.className}`}>
          Current Zone: {currentZone.name}
        </div>
      )}

      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={e => setZoneId(Number(e.target.value))}
        value={zoneId ?? ''}
      >
        <option value="" disabled className="text-black">
          Choose a zone
        </option>
{zoneTypes.map(z => {
  let bgColor = '';
  switch (z.name) {
    case 'Jungle':
      bgColor = 'rgba(120, 53, 15, 0.8)'; // dark yellowish
      break;
    case 'Ocean':
      bgColor = 'rgba(37, 99, 235, 0.8)'; // blue
      break;
    case 'River':
      bgColor = 'rgba(22, 163, 74, 0.8)'; // green
      break;
    case 'Lava':
      bgColor = 'rgba(220, 38, 38, 0.8)'; // red
      break;
  }
  return (
    <option key={z.id} value={z.id} style={{ backgroundColor: bgColor, color: 'white' }}>
      {z.name}
    </option>
  );
})}


      </select>

      <button
        className={`w-full p-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSelect}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Zone'}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-black">{message}</p>
      )}
    </div>
  );
}