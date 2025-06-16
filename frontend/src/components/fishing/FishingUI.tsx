import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useFishingInventory } from './fishinglogic/fishingInventoryLogic';
import { FishingInventoryUI } from './fishingui/FishingInventoryUI';
import { BasicFishingUI } from './fishingui/BasicFishingUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: invLoading, error, refetch } = useFishingInventory();

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  // Merge user email into data for UI
  const combinedData = data ? { ...data, email: user.email } : null;

  return (
  <div className="space-y-4">
    <BasicFishingUI refetch={refetch} />
    <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
    <ZoneSelector refetch={refetch} />
  </div>
);
}