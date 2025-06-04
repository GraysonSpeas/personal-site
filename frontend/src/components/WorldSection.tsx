import React, { useState } from 'react';

interface WorldSectionProps {
  title: string;
  backgroundImageHorizontal: string;
  backgroundImageVertical: string;
  hasNewBadge?: boolean;
  onClick?: () => void;
  className?: string; // accept extra classes
}

export const WorldSection = ({
  title,
  backgroundImageHorizontal,
  backgroundImageVertical,
  hasNewBadge,
  onClick,
  className = '',
}: WorldSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        group cursor-pointer relative
        flex-grow basis-0 max-w-[33.3333%]
        h-full
        overflow-hidden rounded-lg
        border-4 border-transparent hover:border-white transition-all duration-300
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ minWidth: 0 }} // prevents flexbox overflow issues with text/content
    >
      {/* Desktop Horizontal Background */}
      <div
        className="absolute inset-0 bg-cover bg-center hidden md:block transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: `url(${backgroundImageHorizontal})`,
          filter: 'brightness(0.75)',
        }}
      />
      {/* Mobile Vertical Background */}
      <div
        className="absolute inset-0 bg-cover bg-center block md:hidden transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: `url(${backgroundImageVertical})`,
          filter: 'brightness(0.75)',
        }}
      />
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Title */}
      <h1
        className={`absolute bottom-0 left-0 right-0 px-3 py-2 bg-black bg-opacity-70 text-white uppercase font-black text-xl md:text-[2vw] flex items-center justify-between gap-2 transition-transform duration-500 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <span>{title}</span>
        {hasNewBadge && (
          <span className="goldentext font-mono font-bold text-xs md:text-[1vw] uppercase translate-y-1">
            New
          </span>
        )}
      </h1>
    </div>
  );
};