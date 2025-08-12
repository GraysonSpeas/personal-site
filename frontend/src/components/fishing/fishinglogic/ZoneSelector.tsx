import React, { useState } from 'react';
import { API_BASE } from '../../../config.tsx';

const zoneTypes = [
  { id: 1, name: 'Jungle', className: 'bg-yellow-900 bg-opacity-80' },
  { id: 2, name: 'Ocean', className: 'bg-blue-600 bg-opacity-80' },
  { id: 3, name: 'River', className: 'bg-green-600 bg-opacity-80' },
  { id: 4, name: 'Lava', className: 'bg-red-600 bg-opacity-80' },
  {
    id: 5,
    name: 'Tidal',
    className: 'bg-indigo-600 bg-opacity-80',
    available_times: [
      { start: '10:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '19:00', end: '19:30' },
    ],
  },
];

function isZoneAvailable(zone: typeof zoneTypes[0]): boolean {
  if (!zone.available_times) return true;

  const now = new Date();

  return zone.available_times.some(({ start, end }) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTime = new Date(now);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endH, endM, 0, 0);

    return now >= startTime && now <= endTime;
  });
}

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

  const currentZone = zoneTypes.find((z) => z.id === currentZoneId);

  const getBgColor = (name: string) => {
    switch (name) {
      case 'Jungle':
        return 'rgba(120, 53, 15, 0.8)';
      case 'Ocean':
        return 'rgba(37, 99, 235, 0.8)';
      case 'River':
        return 'rgba(22, 163, 74, 0.8)';
      case 'Lava':
        return 'rgba(220, 38, 38, 0.8)';
      case 'Tidal':
        return 'rgba(79, 70, 229, 0.8)';
      default:
        return 'rgba(100, 100, 100, 0.8)';
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Select a Zone</h2>

      {currentZone && (
        <div
          className={`p-2 rounded text-white text-center mb-4 ${currentZone.className}`}
        >
          Current Zone: {currentZone.name}
        </div>
      )}

      <select
        className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
        onChange={(e) => setZoneId(Number(e.target.value))}
        value={zoneId ?? ''}
      >
        <option value="" disabled className="text-black">
          Choose a zone
        </option>
        {zoneTypes.map((z) => {
          const available = isZoneAvailable(z);
          const bgColor = getBgColor(z.name);
          return (
            <option
              key={z.id}
              value={z.id}
              style={{
                backgroundColor: available ? bgColor : 'gray',
                color: available ? 'white' : '#aaa',
                opacity: available ? 1 : 0.5,
              }}
              disabled={!available}
            >
              {z.name}
            </option>
          );
        })}
      </select>

      <div className="mt-4 mb-4 text-sm text-gray-700">
        <strong>Zone Open Times:</strong>
        <ul className="list-disc list-inside">
          {zoneTypes.map((zone) => (
            <li key={zone.id}>
              <span className="font-semibold">{zone.name}:</span>{' '}
              {zone.available_times
                ? zone.available_times
                    .map(({ start, end }) => `${start} - ${end}`)
                    .join(', ')
                : 'Always open'}
            </li>
          ))}
        </ul>
      </div>

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
        <p className="mt-4 text-center text-sm font-medium text-black">
          {message}
        </p>
      )}
    </div>
  );
}