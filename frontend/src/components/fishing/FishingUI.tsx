import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useFishingInventory } from './fishinglogic/fishingInventoryLogic';
import { FishingInventoryUI } from './fishingui/FishingInventoryUI';
import { FishingMinigameUI } from './fishingui/FishingMinigameUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector';
import { GearSelector } from './fishinglogic/GearSelector';
import { Merchant } from './fishinglogic/Merchant';
import { TimeContentProvider } from './fishinglogic/TimeContentProvider';
import { WeatherSection } from './fishinglogic/WeatherSection';
import { DailyCatchSection } from './fishinglogic/DailyCatchSection';
import { QuestSection } from './fishinglogic/QuestSection';

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: invLoading, error, refetch: refetchInventory } = useFishingInventory();

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <TimeContentProvider
      render={({ weather, catchOfTheDay, quests, worldState, refresh, loading }) => (
        <div
  style={{
    display: 'grid',
    gridTemplateColumns: '650px 620px 420px', // left wider, right narrower
    gap: '16px', // reduce gap slightly
    alignItems: 'flex-start',
  }}
>
  {/* LEFT: Weather + Quest */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <WeatherSection weather={weather} worldState={worldState} />
    <QuestSection quests={quests} />
  </div>

  {/* MIDDLE: Fishing + Zone + Gear */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {/* Fishing Minigame */}
<div style={{ minHeight: '300px' }}>
  <FishingMinigameUI refetchTime={refresh} refetchInventory={refetchInventory} />
</div>
    <ZoneSelector refetch={refetchInventory} currentZoneId={data?.current_zone_id ?? null} />
    {combinedData && (
      <GearSelector
        gear={combinedData.gear ?? []}
        bait={combinedData.bait ?? []}
        refetch={refetchInventory}
      />
    )}
  </div>

  {/* RIGHT: Inventory + Catch of Day + Merchant */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0, marginLeft: '-120px' }}>
    {combinedData && (
      <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
    )}
    <div style={{ width: 385 }}>
      <DailyCatchSection catchOfTheDay={catchOfTheDay} />
    </div>
    <Merchant refetchInventory={refetchInventory} />
  </div>
</div>
      )}
    />
  );
}