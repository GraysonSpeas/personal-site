export const ScrollToExplore = () => {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <div className="hidden md:flex fixed items-center justify-center gap-3 bg-black hover:border-white text-white duration-300 transition-all overflow-hidden add-pbt-hover cursor-pointer z-[100] bottom-4 right-4 px-4 py-2 rounded-full border border-solid border-primary-white/20 shadow-xl hover:shadow-2xl">
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
          className="animate-bounce"
        >
          <path d="M7 13l3 3 3-3" />
          <path d="M7 6l3 3 3-3" />
        </svg>
      </button>
    </div>
  )
}