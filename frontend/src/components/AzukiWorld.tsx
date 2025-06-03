import React from "react";
import { WorldSection, FullscreenModal, ScrollToExplore } from "../components/AzukiComponents";

export default function AzukiWorld() {
  const handleAzukiClick = () => {
    alert("Azuki clicked!");
    // You can add modal logic or page transition here
  };

  return (
    <div className="bg-black text-white overflow-x-hidden min-h-screen">
      {/* Header is rendered in the wrapper — no need to re-render it here */}

      <ScrollToExplore />

      <main className="pt-24 space-y-20">
        <WorldSection
          title="Azuki"
          backgroundImage="/assets/worlds/azuki.jpg"
          hasNewBadge={true}
          onClick={handleAzukiClick}
        />
        <WorldSection
          title="Beanz"
          backgroundImage="/assets/worlds/beanz.jpg"
          onClick={() => alert("Beanz section clicked!")}
        />
        <WorldSection
          title="Elementals"
          backgroundImage="/assets/worlds/elementals.jpg"
          onClick={() => alert("Elementals section clicked!")}
        />
      </main>

      <FullscreenModal
        isOpen={false}
        imageSrc=""
        title=""
        onClose={() => {}}
      />
    </div>
  );
}