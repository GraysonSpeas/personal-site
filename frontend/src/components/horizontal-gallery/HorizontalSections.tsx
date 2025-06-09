import React, { useState, useEffect, useRef } from "react";
import {
  WorldSection,
  FullscreenModal,
  ScrollToExplore,
} from "./HorizontalComponents";
import { useWindowWidth } from "../../hooks/useWindowWidth";

export default function HorizontalSections() {
  const windowWidth = useWindowWidth();
  const isVertical = windowWidth < 764;
  const containerRef = useRef<HTMLDivElement>(null);

  const [modalData, setModalData] = useState<{
    title: string;
    imageSrc: string;
  } | null>(null);

  const handleClick = (title: string) => {
    const slug = title.toLowerCase();
    setModalData({
      title,
      imageSrc: `/assets/panels/${slug}-${isVertical ? "vertical" : "horizontal"}.jpg`,
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isVertical) return;

    let velocity = 0;
    let animationFrame: number | null = null;

    const friction = 0.96;
    const stepMultiplier = 0.0438;
    const maxVelocity = 13;
    const stopThreshold = 0.02;

    const animate = () => {
      if (Math.abs(velocity) > stopThreshold) {
        container.scrollLeft += velocity;
        velocity *= friction;
        animationFrame = requestAnimationFrame(animate);
      } else {
        velocity = 0;
        animationFrame = null;
      }
    };

    const normalizeDelta = (e: WheelEvent) => {
      let delta = e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
      else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;
      return delta;
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const delta = normalizeDelta(e) * stepMultiplier;
        velocity += delta;
        velocity = Math.max(-maxVelocity, Math.min(velocity, maxVelocity));
        if (!animationFrame) animate();
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isVertical]);

  const sections = [
    { title: "Panel1", hasNewBadge: true },
    { title: "Panel2" },
    { title: "Panel3" },
    { title: "Panel4" },
    { title: "Panel5" },
    { title: "Panel6" },
    { title: "Panel7" },
    { title: "Panel8" },
  ];

  return (
    <div className="bg-[#1a1a1a] text-white relative w-screen h-screen flex flex-col">
      <ScrollToExplore />

      <main
        ref={containerRef}
        className={`
          flex
          ${isVertical
            ? "flex-col w-full overflow-y-auto"
            : "flex-row overflow-x-auto overflow-y-hidden w-screen py-[4px] mb-[7px] px-[4px]"
          }
          flex-grow
          no-scrollbar
        `}
        style={{ scrollSnapType: undefined }}
      >
        {sections.map(({ title, hasNewBadge }, index) => {
          const slug = title.toLowerCase();
          return (
            <WorldSection
              key={title}
              title={title}
              backgroundImageHorizontal={`/assets/panels/${slug}-horizontal.jpg`}
              backgroundImageVertical={`/assets/panels/${slug}-vertical.jpg`}
              hasNewBadge={hasNewBadge}
              onClick={() => handleClick(title)}
              className={`group transition-transform duration-300 ease-out
                ${
                  isVertical
                    ? "w-full h-[250px]"
                    : "w-[clamp(250px,23vw,420px)] h-[calc(100vh-7px)] flex-shrink-0"
                }`}
              style={isVertical ? undefined : { scrollSnapAlign: "start" }}
              initialGrayscale={index === 0 ? 0 : 1}
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
