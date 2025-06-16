import React, { useState } from 'react';
import { API_BASE } from '../../../config.tsx';

const zoneTypes = [
  { id: 1, name: 'Jungle' },
  { id: 2, name: 'Ocean' },
  { id: 3, name: 'River' },
  { id: 4, name: 'Lava' },
];

export function ZoneSelector({ refetch }: { refetch: () => void }) {
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
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Zone updated successfully!');
        if (refetch && typeof refetch === 'function') {
          refetch();
        } else {
          console.error('refetch is not a function', refetch);
        }
      } else {
        setMessage(data.error || 'Failed to update the zone.');
      }
    } catch (error) {
      console.error('Zone update error:', error);
      setMessage('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Select a Zone</h2>
      <select
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={e => setZoneId(Number(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled>
          Choose a zone
        </option>
        {zoneTypes.map(z => (
          <option key={z.id} value={z.id} className="text-black">
            {z.name}
          </option>
        ))}
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