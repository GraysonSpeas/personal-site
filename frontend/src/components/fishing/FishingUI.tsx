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

  const {
    fishCount,
    lastCatch,
    fish,
    sellFish, // ✅ new
    loading: fishLoading,
    error,
    xp,
    level,
    gold,
    cooldown,
  } = useFishingLogic();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Welcome, {user.email || 'Fisher'}! Let’s fish!</p>
      <p>
        Fish caught: <strong>{fishCount}</strong>
      </p>
      <p>
        XP: <strong>{xp}</strong> — Level: <strong>{level}</strong> — Gold:{' '}
        <strong>{gold}</strong>
      </p>

      {lastCatch !== null && (
        <div className="mt-4 text-sm text-gray-600">
          {lastCatch ? (
            <p>🎣 You caught a fish!</p>
          ) : (
            <p>🐟 No fish this time. Try again!</p>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={fish}
          disabled={fishLoading || cooldown > 0}
          className={`px-4 py-2 rounded text-white ${
            fishLoading || cooldown > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {fishLoading
            ? 'Fishing...'
            : cooldown > 0
            ? `Wait ${cooldown}s`
            : 'Catch a fish!'}
        </button>

        <button
          onClick={sellFish}
          disabled={fishCount === 0 || fishLoading}
          className={`px-4 py-2 rounded text-white ${
            fishCount === 0 || fishLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Sell Fish
        </button>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>
          Error: {error}. Please try again.
        </p>
      )}
    </div>
  );
}