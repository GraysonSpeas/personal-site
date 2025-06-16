import React, { type RefObject } from "react";

interface ScrollToExploreProps {
  containerRef: RefObject<HTMLDivElement | null>; // Allow null
}

export const ScrollToExplore: React.FC<ScrollToExploreProps> = ({ containerRef }) => {
  const handleScroll = () => {
    if (containerRef?.current) {
      containerRef.current.scrollBy({
        left: window.innerWidth / 5, // Adjust scroll distance as needed
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="hidden md:flex fixed items-center justify-center gap-3 bg-black hover:border-white text-white duration-300 transition-all overflow-hidden cursor-pointer z-[100] bottom-4 right-4 px-4 py-2 rounded-full border border-solid border-primary-white/20 shadow-xl hover:shadow-2xl">
        <button
          onClick={handleScroll}
          className="font-sans font-medium text-sm uppercase flex items-center gap-2"
          aria-label="Scroll to explore"
        >
          <span>Scroll to explore</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce-x"
          >
            <path d="M11 7l5 5-5 5" /> {/* Right-pointing chevron */}
          </svg>
        </button>
      </div>

      {/* Horizontal bounce animation */}
      <style>
        {`
          @keyframes bounce-horizontal {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(4px);
            }
          }

          .animate-bounce-x {
            animation: bounce-horizontal 1s infinite;
          }
        `}
      </style>
    </>
  );
};
