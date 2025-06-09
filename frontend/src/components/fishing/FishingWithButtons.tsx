import React, { useEffect } from 'react';
import { useFishingLogic } from './FishingLogic';
import { useAuth } from '../auth/AuthContext'; // adjust path

export function FishingWithButtons() {
  const { user, loading: authLoading } = useAuth(); // Correct casing here
  const { fishCount, fish, loading: fishLoading, error } = useFishingLogic();

  // Debugging logs
  useEffect(() => {
    console.log('FishingWithButtons - Auth state:', { authLoading, user });
    console.log('FishingLogic state:', { fishCount, fishLoading, error });
  }, [authLoading, user, fishCount, fishLoading, error]);

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
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Welcome, {user.email || 'Fisher'}! Let’s fish!</p>
      <p>Fish caught: {fishCount}</p>
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