import React, { useState } from "react";

interface WorldSectionProps {
  title: string;
  backgroundImageHorizontal: string;
  backgroundImageVertical: string;
  hasNewBadge?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  initialGrayscale?: number; // Controls initial grayscale (0 to 1)
}

export const WorldSection = ({
  title,
  backgroundImageHorizontal,
  backgroundImageVertical,
  hasNewBadge,
  onClick,
  className = "",
  style,
  initialGrayscale = 1,
}: WorldSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const filterValue = isHovered
    ? "grayscale(0) brightness(1)"
    : `grayscale(${initialGrayscale}) brightness(0.55)`;

  const transformValue = isHovered ? "translateY(-20px)" : "translateY(0)";

  const transitionValue = "filter 0.5s ease, transform 0.5s ease";

  const showShine = initialGrayscale < 1;

  return (
    <div
      className={`
        group cursor-pointer relative
        h-[calc(100vh-64px)] overflow-hidden rounded-lg
        border-4 border-transparent hover:border-white transition-all duration-300
        bg-[#171717]
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ minWidth: 0, ...style }}
    >
      {/* Desktop Background */}
      <div
        className="absolute inset-0 bg-cover bg-center hidden md:block pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImageHorizontal})`,
          filter: filterValue,
          transform: transformValue,
          transition: transitionValue,
          willChange: "filter, transform",
        }}
      />

      {/* Mobile Background */}
      <div
        className="absolute inset-0 bg-cover bg-center block md:hidden pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImageVertical})`,
          filter: filterValue,
          transform: transformValue,
          transition: transitionValue,
          willChange: "filter, transform",
        }}
      />

      {/* Optional subtle overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none z-10"
        style={{ backgroundColor: "rgba(99, 99, 99, 0.05)" }}
      />

      {/* Shine effect overlays */}
     {showShine && (
  <div className="shine-effect pointer-events-none absolute inset-0 rounded-lg z-20" />
)}

<style>{`
  .shine-effect {
    position: absolute;
    top: 50%;
    left: -50%;
    width: 800%;
    height: 125%;
    pointer-events: none;

    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 35%,
      rgba(255, 255, 255, 0.10) 50%,
      rgba(255, 255, 255, 0) 65%
    );

    filter: blur(7px);
    transform: translateY(-50%) rotate(-73deg);
    animation: shine-move 2s linear infinite;
    mix-blend-mode: screen;
    border-radius: inherit;
    z-index: 20;

    will-change: left, opacity;
  }

  @keyframes shine-move {
    0% {
      left: -400%;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      left: 200%;
      opacity: 0;
    }
  }
`}</style>

      {/* Title bar */}
      <h1
        className={`
          absolute bottom-[3px] left-0 right-0 px-4 py-2 z-30
          bg-[#171717] text-white uppercase font-black text-3xl md:text-[2.6vw]
          leading-none
          flex items-center justify-between gap-3
          transition-transform duration-500 ease-in-out
          ${isHovered ? "translate-y-[-10%]" : "translate-y-[120%]"}
        `}
      >
        <span>{title}</span>
        {hasNewBadge && (
          <span className="text-yellow-300 font-mono font-bold text-xs md:text-[1vw] uppercase translate-y-1">
            New
          </span>
        )}
      </h1>
    </div>
  );
};