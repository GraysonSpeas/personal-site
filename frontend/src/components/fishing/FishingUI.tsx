import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useFishingInventory } from './fishinglogic/fishingInventoryLogic';
import { FishingInventoryUI } from './fishingui/FishingInventoryUI';
import { FishingMinigameUI } from './fishingui/FishingMinigameUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector';
import { GearSelector } from './fishinglogic/GearSelector';
import { TimeContentUI } from './fishingui/TimeContentUI';
import { API_BASE } from '../../config';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: invLoading, error, refetch: refetchInventory } = useFishingInventory();

  const [timeContentKey, setTimeContentKey] = useState(0); // trigger refresh via key

  const refetchTimeContent = async () => {
    // just bumping a key will force a re-render/refetch in TimeContentUI
    setTimeContentKey((k) => k + 1);
  };

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <FishingMinigameUI
  refetchTime={refetchTimeContent}
  refetchInventory={refetchInventory}
/>
        <ZoneSelector refetch={refetchInventory} currentZoneId={data?.current_zone_id ?? null} />
        {combinedData && (
          <>
            <GearSelector gear={combinedData.gear ?? []} bait={combinedData.bait ?? []} refetch={refetchInventory} />
            <TimeContentUI key={timeContentKey} refetch={refetchTimeContent} />
          </>
        )}
      </div>
    </div>
  );
}