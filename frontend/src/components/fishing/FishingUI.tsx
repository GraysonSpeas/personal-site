import React, { useState, useCallback } from 'react';
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quest'); // quest | merchant | crafting

  const refetchInventoryAndMerchant = async () => {
    await refetchInventory();
    setMerchantRefetchTrigger((prev) => prev + 1);
  };

  const refetchInventoryAndCrafting = async () => {
    await refetchInventory();
    setCraftingRefetchTrigger((prev) => prev + 1);
  };

  // Stable callbacks for refreshing both
  const refreshMerchant = useCallback(() => {
    setMerchantRefetchTrigger((prev) => prev + 1);
    setCraftingRefetchTrigger((prev) => prev + 1);
  }, []);

  const refreshCrafting = useCallback(() => {
    setCraftingRefetchTrigger((prev) => prev + 1);
    setMerchantRefetchTrigger((prev) => prev + 1);
  }, []);

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <TimeContentProvider
      render={({ weather, catchOfTheDay, quests, worldState, refresh }) => (
        <>
          {/* Top Right: Weather + ZoneSelector */}
          <div
            style={{
              position: 'fixed',
              top: 80,
              right: 16,
              width: 250,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <WeatherUI weather={weather} worldState={worldState} />
            <ZoneSelector
              refetch={refetchInventory}
              currentZoneId={data?.current_zone_id ?? null}
            />
          </div>

          {/* Top Center: Hamburger Toggle (full width overlay, single tab) */}
          <div
            style={{
              position: 'fixed',
              top: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1100,
              width: '100vw',
              maxWidth: '100%',
            }}
          >
            <button
              onClick={() => setMenuOpen((open) => !open)}
              style={{
                padding: '8px 12px',
                fontSize: 16,
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid #ccc',
                backgroundColor: menuOpen ? '#eee' : 'white',
                color: 'black', // black font color
                margin: '0 auto',
                display: 'block',
                maxWidth: 200,
              }}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              ☰ Menu
            </button>

            {menuOpen && (
              <div
                style={{
                  marginTop: 12,
                  backgroundColor: 'white',
                  borderTop: '1px solid #ccc',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  padding: 16,
                  height: '60vh',
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button
                    onClick={() => setActiveTab('quest')}
                    disabled={activeTab === 'quest'}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      cursor: activeTab === 'quest' ? 'default' : 'pointer',
                      backgroundColor: activeTab === 'quest' ? '#cce4ff' : 'white', // light blue bg
                      color: activeTab === 'quest' ? 'black' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                    }}
                  >
                    Quest
                  </button>
                  <button
                    onClick={() => setActiveTab('merchant')}
                    disabled={activeTab === 'merchant'}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      cursor: activeTab === 'merchant' ? 'default' : 'pointer',
                      backgroundColor: activeTab === 'merchant' ? '#cce4ff' : 'white', // light blue bg
                      color: activeTab === 'merchant' ? 'black' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                    }}
                  >
                    Merchant
                  </button>
                  <button
                    onClick={() => setActiveTab('crafting')}
                    disabled={activeTab === 'crafting'}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      cursor: activeTab === 'crafting' ? 'default' : 'pointer',
                      backgroundColor: activeTab === 'crafting' ? '#cce4ff' : 'white', // light blue bg
                      color: activeTab === 'crafting' ? 'black' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                    }}
                  >
                    Crafting
                  </button>
                </div>

                {/* Active Tab Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {activeTab === 'quest' && <QuestUI quests={quests} />}
                  {activeTab === 'merchant' && (
                    <Merchant
                      refetch={refetchInventoryAndMerchant}
                      refetchTrigger={merchantRefetchTrigger}
                      refreshOther={refreshCrafting}
                    />
                  )}
                  {activeTab === 'crafting' && (
                    <Crafting
                      refetch={refetchInventoryAndCrafting}
                      refetchTrigger={craftingRefetchTrigger}
                      refreshOther={refreshMerchant}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

{/* Left Side: Inventory + GearSelector */}
<div
style={{
  position: 'fixed',
  top: 80,
  bottom: 16,     // added to stretch container down
  left: 16,
  width: 350,
  overflowY: 'auto',
  paddingRight: 8,
  zIndex: 500,
}}
>
  {combinedData && (
    <>
      <FishingInventoryUI data={combinedData} loading={invLoading} error={error} />
      <div style={{ marginTop: 16 }}>
        <GearSelector
          gear={combinedData.gear ?? []}
          bait={combinedData.bait ?? []}
          refetch={refetchInventory}
        />
      </div>
    </>
  )}
</div>


          {/* Center Column: Fishing Minigame + Consumables */}
          <div
            style={{
              margin: '0 auto',
              paddingTop: 80,
              maxWidth: 700,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              zIndex: 500,
            }}
          >
            <FishingMinigameUI
              refetchTime={refresh}
              refetchInventory={refetchInventory}
              refetchMerchant={refreshMerchant}
              refetchCrafting={refreshCrafting}
            />
            <Consumables
              refetch={refetchInventory}
              refreshTrigger={craftingRefetchTrigger}
            />
          </div>
        </>
      )}
    />
  );
}