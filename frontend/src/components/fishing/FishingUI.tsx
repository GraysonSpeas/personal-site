// src/fishing/FishingUI.tsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useFishingLogic } from './FishingLogic';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        Loading authentication...
      </p>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Please sign in to start fishing.</p>
        <button
          onClick={() => {
            const btn = document.getElementById('auth-toggle-button');
            if (btn) btn.click();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    );
  }

  const { fishCount, lastCatch, fish, loading: fishLoading, error } = useFishingLogic();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Welcome, {user.email || 'Fisher'}! Let’s fish!</p>
      <p>Fish caught: <strong>{fishCount}</strong></p>

      {lastCatch && (
        <div className="mt-4 text-sm text-gray-600">
          <p>🎣 Last catch: <strong>{lastCatch.rarity}</strong> {lastCatch.name}</p>
          <p>📏 Length: {lastCatch.length} cm — ⚖️ Weight: {lastCatch.weight} kg</p>
        </div>
      )}

      <button
        onClick={fish}
        disabled={fishLoading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {fishLoading ? 'Fishing...' : 'Catch a fish!'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>
          Error: {error}. Please try again.
        </p>
      )}
    </div>
  );
}