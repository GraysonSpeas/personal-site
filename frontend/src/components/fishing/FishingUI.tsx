// src/components/fishing/FishingUI.tsx
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

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <BasicFishingUI refetch={refetch} />
        <ZoneSelector refetch={refetch} />
      </div>
    </div>
  );
}
