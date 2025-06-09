// Export all components for easy integration with Astro
//export { Header } from './Header'
export { WorldSection } from './Panels'
export { FullscreenModal } from './FullscreenModal'
export { ScrollToExplore } from './ScrollToExplore'

// Types for better TypeScript support
export interface WorldData {
  title: string
  backgroundImage: string
  fullscreenImage: string
  hasNewBadge?: boolean
}

export interface HeaderProps {
  onLogoClick?: () => void
}

export interface WorldSectionProps {
  title: string
  backgroundImage: string
  hasNewBadge?: boolean
  onClick?: () => void
}

export interface FullscreenModalProps {
  isOpen: boolean
  imageSrc: string
  title: string
  onClose: () => void
}