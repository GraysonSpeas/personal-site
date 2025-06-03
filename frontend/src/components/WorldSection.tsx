import { useState } from 'react'

interface WorldSectionProps {
  title: string
  backgroundImage: string
  hasNewBadge?: boolean
  onClick?: () => void
}

export const WorldSection = ({ title, backgroundImage, hasNewBadge, onClick }: WorldSectionProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="border-0 group cursor-pointer relative h-full md:h-[calc(100vh-8px)] md:w-full overflow-hidden hover:z-50 border-4 hover:border-solid border-white/0 hover:border-white/100 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.8)'
        }}
      />

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-azukigray-900/80 via-transparent to-transparent" />

      {/* Title */}
      <h1 className={`
        transition-transform flex flex-row duration-500
        ${isHovered ? 'md:translate-y-[0px]' : 'md:translate-y-[100%]'}
        text-white gap-2 md:gap-[.4vw] px-3 py-2 md:px-[1vw] md:py-[.6vw]
        bg-azukigray-900 ease-out absolute md:left-[-2px] md:right-[-2px] bottom-0
        font-800 uppercase text-2xl md:text-[2.5vw] font-black
      `}>
        {title}
        {hasNewBadge && (
          <p className="goldentext font-mono-medium font-bold text-xs md:text-[1vw] translate-y-[4px] md:translate-y-[.6vw] uppercase">
            New
          </p>
        )}
      </h1>
    </div>
  )
}