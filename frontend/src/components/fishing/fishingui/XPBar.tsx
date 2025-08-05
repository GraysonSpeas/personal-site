import React from "react";
import { useFishingInventory } from "../fishinglogic/fishingInventoryLogic";

const XPBar: React.FC = () => {
  const { data, loading } = useFishingInventory();

  if (loading || !data || data.level === undefined || data.xp === undefined) {
    return null; // or a loading spinner
  }

  const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));

  const totalXpToLevel = (n: number) => {
    let total = 0;
    for (let i = 1; i < n; i++) total += xpToLevel(i);
    return total;
  };

  const xpIntoLevel = data.xp - totalXpToLevel(data.level);
  const xpNeeded = xpToLevel(data.level);
  const percent = Math.min((xpIntoLevel / xpNeeded) * 100, 100);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-2 z-50">
      <div className="text-white text-center text-sm mb-1">
        LVL {data.level} — {xpIntoLevel} / {xpNeeded}
      </div>
      <div className="w-full h-3 bg-gray-600 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;