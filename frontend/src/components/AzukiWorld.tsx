import React, { useState, useEffect } from "react";
import {
  WorldSection,
  FullscreenModal,
  ScrollToExplore,
} from "../components/AzukiComponents";

export default function AzukiWorld() {
  const [modalData, setModalData] = useState<{
    title: string;
    imageSrc: string;
  } | null>(null);

  const handleAzukiClick = () => {
    setModalData({
      title: "Azuki",
      imageSrc: "/assets/worlds/azuki-horizontal.jpg",
    });
  };

  const handleBeanzClick = () => {
    setModalData({
      title: "Beanz",
      imageSrc: "/assets/worlds/beanz-horizontal.jpg",
    });
  };

  const handleElementalsClick = () => {
    setModalData({
      title: "Elementals",
      imageSrc: "/assets/worlds/elementals-horizontal.jpg",
    });
  };

  const closeModal = () => {
    setModalData(null);
    document.body.classList.remove("modal-open");
  };

  const openModal = () => {
    document.body.classList.add("modal-open");
  };

  useEffect(() => {
    if (modalData) {
      openModal();
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalData]);

  return (
    <div className="bg-black text-white fixed top-0 left-0 w-screen h-screen flex flex-col overflow-hidden">
      <ScrollToExplore />

      <main className="flex flex-row space-x-6 pt-16 flex-grow min-h-0 overflow-x-auto overflow-y-hidden no-scrollbar">
        <WorldSection
          title="Azuki"
          backgroundImageHorizontal="/assets/worlds/azuki-horizontal.jpg"
          backgroundImageVertical="/assets/worlds/azuki-vertical.jpg"
          hasNewBadge={true}
          onClick={handleAzukiClick}
          className="flex-shrink-0 w-[80vw] sm:w-[90vw] md:w-[100vw]"
        />
        <WorldSection
          title="Beanz"
          backgroundImageHorizontal="/assets/worlds/beanz-horizontal.jpg"
          backgroundImageVertical="/assets/worlds/beanz-vertical.jpg"
          onClick={handleBeanzClick}
          className="flex-shrink-0 w-[80vw] sm:w-[90vw] md:w-[100vw]"
        />
        <WorldSection
          title="Elementals"
          backgroundImageHorizontal="/assets/worlds/elementals-horizontal.jpg"
          backgroundImageVertical="/assets/worlds/elementals-vertical.jpg"
          onClick={handleElementalsClick}
          className="flex-shrink-0 w-[80vw] sm:w-[90vw] md:w-[100vw]"
        />
      </main>

      <FullscreenModal
        isOpen={!!modalData}
        title={modalData?.title ?? ""}
        imageSrc={modalData?.imageSrc ?? ""}
        onClose={closeModal}
      />
    </div>
  );
}