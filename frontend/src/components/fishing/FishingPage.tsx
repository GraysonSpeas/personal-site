import React from "react";
import { FishingUI } from "./FishingUI";
import HorizontalHeader from "../horizontal-gallery/HorizontalHeader";

export default function FishingPage() {
  return (
    <>
      {/* Fixed header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000 }}>
        <HorizontalHeader
          onLogoClick={() => window.location.assign("/")}
          onNavigate={(page) => window.location.assign(`/${page}`)}
        />
      </div>

      {/* Main fishing area */}
      <div className="flex flex-col justify-center items-center min-h-screen bg-blue-900 pt-20 px-4">
        <FishingUI />
      </div>
    </>
  );
}
