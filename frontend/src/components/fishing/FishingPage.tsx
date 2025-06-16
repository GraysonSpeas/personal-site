// src/components/fishing/FishingPage.tsx
import React from 'react';
import { useFishingInventory } from './fishinglogic/fishingInventoryLogic';
import { FishingInventoryUI } from './fishingui/FishingInventoryUI';
import { useAuth } from '../auth/AuthProvider';
import { BasicFishingUI } from './fishingui/BasicFishingUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector'; // Adjust path as needed

function InnerFishingPage() {
  const { user, loading: authLoading, logout } = useAuth();
const { data, loading: inventoryLoading, error, refetch } = useFishingInventory();
  if (authLoading) {
    return (
      <p className="text-center mt-24 text-lg text-gray-400">
        Checking your session…
      </p>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-24">
        <p className="mb-4 text-yellow-300">You must be logged in to fish.</p>
        <button
          onClick={() => {
            const btn = document.getElementById('auth-toggle-button');
            if (btn) btn.click();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="text-center mt-12">
      <FishingInventoryUI data={data} loading={inventoryLoading} error={error} />
      <div className="mt-8">
        <BasicFishingUI />
      </div>
      <div className="mt-8">
        <ZoneSelector refetch={refetch} />
      </div>
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Log Out
      </button>
    </div>
  );
}

export default function FishingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-900">
      <InnerFishingPage />
    </div>
  );
}