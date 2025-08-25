import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { FishingInventory } from './fishingui/FishingInventory';
import { FishingMinigameUI } from './fishingui/FishingMinigameUI';
import { ZoneSelector } from './fishinglogic/ZoneSelector';
import { GearSelector } from './fishinglogic/GearSelector';
import { Merchant } from './fishinglogic/Merchant';
import { TimeContentProvider } from './fishinglogic/TimeContentProvider';
import { WeatherUI } from './fishingui/WeatherUI';
import { QuestUI } from './fishingui/QuestUI';
import { Crafting } from './fishinglogic/Crafting';
import { Consumables } from './fishinglogic/Consumables';
import XPBar from './fishingui/XPBar';
import Collections from './fishingui/Collections';
import { Planters } from './fishinglogic/Planters';

import { API_BASE } from '../../config';

export type InventoryData = {
  fishStacks: any[];
  biggestFish: any[];
  email?: string;
  currency?: Record<string, number>;
  resources?: any[];
  gear?: any[];
  bait?: any[];
  consumables?: any[];
  seeds?: any[];
  current_zone_id: number | null;
  xp?: number;
  level?: number;
};

export function FishingUI() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refetchTrigger, setRefetchTrigger] = useState({ merchant: 0, crafting: 0, planters: 0 });

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quest' | 'merchant' | 'crafting' | 'collections' | 'planters'>('quest');
  const [currentZoneId, setCurrentZoneId] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inventory`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setData({
        fishStacks: json.fishStacks || json.fish || [],
        biggestFish: json.biggestFish || [],
        email: json.email,
        currency: json.currency,
        resources: json.resources,
        gear: json.gear,
        bait: json.bait,
        consumables: json.consumables || [],
        seeds: json.seeds || [],
        current_zone_id: json.current_zone_id ?? json.currentZoneId ?? null,
        xp: json.xp,
        level: json.level,
      });
      setCurrentZoneId(json.current_zone_id ?? null);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Unified refetch
  const triggerRefetch = useCallback((tabs: Array<'merchant' | 'crafting' | 'planters'> = []) => {
    setRefetchTrigger(prev => {
      const updated = { ...prev };
      tabs.forEach(tab => { updated[tab] += 1; });
      return updated;
    });
  }, []);

  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  const combinedData = data ? { ...data, email: user.email } : null;

  return (
    <TimeContentProvider
      render={({ weather, quests, worldState, refresh }) => (
        <>
          <div style={{ position: 'fixed', top: 80, right: 16, width: 250, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <WeatherUI weather={weather} worldState={worldState} />
            <ZoneSelector refetch={fetchInventory} currentZoneId={currentZoneId} />
          </div>

          <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: '100vw', maxWidth: '100%' }}>
            <button onClick={() => setMenuOpen(open => !open)} style={{ padding: '8px 12px', fontSize: 16, cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc', backgroundColor: menuOpen ? '#eee' : 'white', color: 'black', margin: '0 auto', display: 'block', maxWidth: 200 }}>
              ☰ Menu
            </button>
            {menuOpen && (
              <div style={{ marginTop: 12, backgroundColor: 'white', borderTop: '1px solid #ccc', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', padding: 16, height: '60vh', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {['quest','merchant','crafting','collections','planters'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} disabled={activeTab === tab} style={{ flex:1, padding:'8px 12px', cursor: activeTab===tab?'default':'pointer', backgroundColor: activeTab===tab?'#cce4ff':'white', color: activeTab===tab?'black':'#333', border:'1px solid #ccc', borderRadius:4 }}>
                      {tab.charAt(0).toUpperCase()+tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ flex:1, overflowY:'auto' }}>
                  {activeTab==='quest' && <QuestUI quests={quests} />}
                  {activeTab==='merchant' && <Merchant refetch={fetchInventory} refetchTrigger={refetchTrigger.merchant} refreshOther={() => triggerRefetch(['crafting','planters'])} />}
                  {activeTab==='crafting' && <Crafting refetch={fetchInventory} refetchTrigger={refetchTrigger.crafting} refreshOther={() => triggerRefetch(['merchant','planters'])} />}
                  {activeTab==='collections' && <Collections />}
                  {activeTab==='planters' && <Planters refreshInventory={fetchInventory} refreshTrigger={refetchTrigger.planters} />}
                </div>
              </div>
            )}
          </div>

          <div style={{ position:'fixed', top:80, bottom:16, left:16, width:450, overflowY:'auto', paddingRight:8, zIndex:500 }}>
            {combinedData && <>
              <FishingInventory data={combinedData} />
              <div style={{ marginTop:16 }}>
                <GearSelector gear={combinedData.gear||[]} bait={combinedData.bait||[]} refetch={fetchInventory} />
              </div>
            </>}
          </div>

          <div style={{ margin:'0 auto', paddingTop:80, maxWidth:700, display:'flex', flexDirection:'column', gap:12, zIndex:500 }}>
            <FishingMinigameUI
              refetchInventory={fetchInventory}
              refetchTime={refresh}
              refetchMerchant={() => triggerRefetch(['merchant'])}
              refetchCrafting={() => triggerRefetch(['crafting'])}
              currentZoneId={currentZoneId}
              setCurrentZoneId={setCurrentZoneId}
            />
            <Consumables refetch={fetchInventory} refreshTrigger={refetchTrigger.crafting} />
          </div>

          {data && data.level != null && data.xp != null && (
            <XPBar level={data.level} xp={data.xp} />
          )}
        </>
      )}
    />
  );
}