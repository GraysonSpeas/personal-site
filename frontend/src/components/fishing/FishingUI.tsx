import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useFishingInventory } from './fishinglogic/fishingInventoryLogic';
import { FishingInventoryUI } from './fishingui/FishingInventoryUI';
import { FishingMinigameUI } from './fishingui/FishingMinigameUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector';
import { GearSelector } from './fishinglogic/GearSelector';
import { Merchant } from './fishinglogic/Merchant';
import { TimeContentProvider } from './fishinglogic/TimeContentProvider';
import { WeatherUI } from './fishingui/WeatherUI';
import { QuestUI } from './fishingui/QuestUI';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: invLoading, error, refetch: refetchInventory } = useFishingInventory();

  const [merchantRefetchTrigger, setMerchantRefetchTrigger] = useState(0);

  const refetchMerchant = () => setMerchantRefetchTrigger((prev) => prev + 1);

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <TimeContentProvider
      render={({ weather, catchOfTheDay, quests, worldState, refresh }) => (
        <>
          {/* Weather fixed top-right under header */}
          <div style={{ position: 'fixed', top: '60px', right: '16px', zIndex: 1000 }}>
            <WeatherUI weather={weather} worldState={worldState} />
          </div>

          {/* Merchant fixed below weather */}
          <div style={{ position: 'fixed', top: '356px', right: '16px', width: '400px' }}>
            <Merchant refetch={refetchInventory} refetchTrigger={merchantRefetchTrigger} />
          </div>

          {/* Left side: Inventory + Quest */}
          <div style={{ position: 'fixed', top: '80px', left: '16px', width: '400px' }}>
            {combinedData && (
              <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
            )}
            <div style={{ marginTop: '16px' }}>
              <QuestUI quests={quests} />
            </div>
          </div>

          {/* TOP: Fishing game + Gear */}
          <div
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              paddingTop: '80px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 500,
            }}
          >
            <FishingMinigameUI
              refetchTime={refresh}
              refetchInventory={refetchInventory}
              refetchMerchant={refetchMerchant}
            />
            {combinedData && (
              <GearSelector
                gear={combinedData.gear ?? []}
                bait={combinedData.bait ?? []}
                refetch={refetchInventory}
              />
            )}
            <ZoneSelector refetch={refetchInventory} currentZoneId={data?.current_zone_id ?? null} />
          </div>
        </>
      )}
    />
  );
}