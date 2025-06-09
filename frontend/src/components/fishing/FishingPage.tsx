import React from 'react';
import { FishingWithButtons } from './FishingWithButtons';
import { useAuth } from '../auth/AuthProvider';

function InnerFishingPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '100px' }}>Checking your session…</p>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p>You must be logged in to fish.</p>
        <button
          onClick={() => {
            const btn = document.getElementById('auth-toggle-button');
            if (btn) btn.click(); // Trigger the login modal
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <FishingWithButtons />
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
}

export default function FishingPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <InnerFishingPage />
    </div>
  );
}