import React from "react";

interface XPBarProps {
  level: number;
  xp: number;
}

const XPBar: React.FC<XPBarProps> = ({ level, xp }) => {
  const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));

  const totalXpToLevel = (n: number) => {
    let total = 0;
    for (let i = 1; i < n; i++) total += xpToLevel(i);
    return total;
  };

  const xpIntoLevel = xp - totalXpToLevel(level);
  const xpNeeded = xpToLevel(level);
  const percent = Math.min((xpIntoLevel / xpNeeded) * 100, 100);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-2 z-50">
      <div className="text-white text-center text-sm mb-1">
        LVL {level} — {xpIntoLevel} / {xpNeeded}
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