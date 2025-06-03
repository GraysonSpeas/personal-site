import { useEffect } from 'react'

interface FullscreenModalProps {
  isOpen: boolean
  imageSrc: string
  title: string
  onClose: () => void
}

export const FullscreenModal = ({ isOpen, imageSrc, title, onClose }: FullscreenModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fullscreen-modal animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors p-2"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <div className="absolute top-4 left-4 z-50">
          <h2 className="text-white text-2xl font-black uppercase font-msbee">
            {title}
          </h2>
        </div>

        {/* Image */}
        <img
          src={imageSrc}
          alt={title}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Navigation hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  )
}