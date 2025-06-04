import React, { useState, useEffect } from "react";
import {
  WorldSection,
  FullscreenModal,
  ScrollToExplore,
} from "../components/AzukiComponents";
import { useWindowWidth } from "../hooks/useWindowWidth";

export default function AzukiWorld() {
  const windowWidth = useWindowWidth();
  const isVertical = windowWidth < 1024;

  const [modalData, setModalData] = useState<{
    title: string;
    imageSrc: string;
  } | null>(null);

  const handleClick = (title: string) => {
    const slug = title.toLowerCase();
    setModalData({
      title,
      imageSrc: `/assets/worlds/${slug}-${isVertical ? "vertical" : "horizontal"}.jpg`,
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
    <div className="bg-black text-white fixed top-0 left-0 w-screen h-screen flex flex-col">
      <ScrollToExplore />

      <main
  className={`
    flex
    ${isVertical ? "flex-col items-center overflow-y-auto" : "flex-row overflow-x-auto overflow-y-hidden"}
    ${isVertical ? "" : "w-[150vw] h-full"}
    pt-16 flex-grow no-scrollbar
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
        className={`flex-shrink-0 relative ${
          isVertical
            ? "w-full max-w-[300px] h-[250px]" // <- This line limits width to 600px
            : "w-[200px] h-[calc(100vh-64px)]"
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
