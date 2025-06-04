import React, { useState, useEffect } from "react";
import {
  WorldSection,
  FullscreenModal,
  ScrollToExplore,
} from "../components/AzukiComponents";
import { useWindowWidth } from "../hooks/useWindowWidth";

export default function AzukiWorld() {
  const windowWidth = useWindowWidth();
  const isHorizontal = windowWidth >= 1024; // Horizontal on large screens

  const [modalData, setModalData] = useState<{
    title: string;
    imageSrc: string;
  } | null>(null);

  const handleClick = (title: string) => {
    const slug = title.toLowerCase();
    setModalData({
      title,
      imageSrc: `/assets/worlds/${slug}-${isHorizontal ? "horizontal" : "vertical"}.jpg`,
    });
  };

  const closeModal = () => {
    setModalData(null);
    document.body.classList.remove("modal-open");
  };

  useEffect(() => {
    if (modalData) {
      document.body.classList.add("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalData]);

  const sections = [
    { title: "Azuki", hasNewBadge: true },
    { title: "Beanz" },
    { title: "Elementals" },
    { title: "Garden" },
    { title: "Alley" },
    { title: "Ruins" },
  ];

  return (
    <div className="bg-black text-white fixed top-0 left-0 w-screen h-screen flex flex-col overflow-hidden">
      <ScrollToExplore />

      <main
        className={`
          flex
          ${isHorizontal ? "flex-row overflow-x-auto overflow-y-hidden" : "flex-col overflow-y-auto overflow-x-hidden"}
          ${isHorizontal ? "space-x-6" : "space-y-6"}
          pt-16 px-4 pb-6 flex-grow min-h-0 no-scrollbar
        `}
      >
        {sections.map(({ title, hasNewBadge }) => {
          const slug = title.toLowerCase();
          return (
            <WorldSection
              key={title}
              title={title}
              backgroundImageHorizontal={`/assets/worlds/${slug}-horizontal.jpg`}
              backgroundImageVertical={`/assets/worlds/${slug}-vertical.jpg`}
              hasNewBadge={hasNewBadge}
              onClick={() => handleClick(title)}
              className={`flex-shrink-0 ${
                isHorizontal
                  ? "w-[400px] h-full"
                  : "w-full h-[250px]"
              }`}
            />
          );
        })}
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
