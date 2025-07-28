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
import { Crafting } from './fishinglogic/Crafting';
import { Consumables } from './fishinglogic/Consumables';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: invLoading, error, refetch: refetchInventory } = useFishingInventory();

  const [merchantRefetchTrigger, setMerchantRefetchTrigger] = useState(0);
  const [craftingRefetchTrigger, setCraftingRefetchTrigger] = useState(0);

  // Inventory + Merchant refresh
  const refetchInventoryAndMerchant = async () => {
    await refetchInventory();
    setMerchantRefetchTrigger((prev) => prev + 1);
  };

  // Inventory + Crafting refresh
  const refetchInventoryAndCrafting = async () => {
    await refetchInventory();
    setCraftingRefetchTrigger((prev) => prev + 1);
  };

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <TimeContentProvider
      render={({ weather, catchOfTheDay, quests, worldState, refresh }) => (
        <>
          <div style={{ position: 'fixed', top: '60px', right: '16px', zIndex: 1000 }}>
            <WeatherUI weather={weather} worldState={worldState} />
          </div>

          <div style={{ position: 'fixed', top: '356px', right: '16px', width: '400px' }}>
            <Merchant
              refetch={refetchInventoryAndMerchant}
              refetchTrigger={merchantRefetchTrigger}
              refreshOther={() => setCraftingRefetchTrigger((prev) => prev + 1)}
            />
            <div style={{ marginTop: '16px' }}>
              <Crafting
                refetch={refetchInventoryAndCrafting}
                refetchTrigger={craftingRefetchTrigger}
                refreshOther={() => setMerchantRefetchTrigger((prev) => prev + 1)}
              />
            </div>
          </div>

          <div style={{ position: 'fixed', top: '80px', left: '16px', width: '400px' }}>
            {combinedData && (
              <>
                <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
                <div style={{ marginTop: '16px' }}>
<Consumables
  owned={(combinedData?.consumables ?? [])
    .filter(
      (c): c is { consumable_id: number; type_id: number; name: string; quantity: number } =>
        typeof c.consumable_id === 'number' &&
        typeof c.type_id === 'number' &&
        typeof c.name === 'string' &&
        typeof c.quantity === 'number'
    )
    .map((c) => ({
      consumable_id: c.consumable_id,
      type_id: c.type_id,
      name: c.name,
      quantity: c.quantity,
    }))}
  refetch={refetchInventory}
/>
                </div>
              </>
            )}
            <div style={{ marginTop: '16px' }}>
              <QuestUI quests={quests} />
            </div>
          </div>

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
              refetchMerchant={() => setMerchantRefetchTrigger((prev) => prev + 1)}
              refetchCrafting={() => setCraftingRefetchTrigger((prev) => prev + 1)}
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