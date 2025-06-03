import React, { useState } from 'react';

interface HeaderProps {
  onLogoClick?: () => void;
}

const AzukiHeader = ({ onLogoClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'ABOUT', href: '/about' },
    { label: 'BEANZ', href: '/beanz' },
    { label: 'LORE', href: '#' },
    { label: 'MORE', href: '#' },
    { label: 'SOCIALS', href: '#' },
    { label: 'BUY', href: '#' }
  ];

  return (
    <div className="fixed w-full top-0 lg:pl-6 lg:pr-6 pl-5 pr-4 px-5 z-70 h-[64px]">
      <div className="group flex h-full border-b border-white items-center justify-between mx-auto relative z-10 border-opacity-0">

        {/* Logo */}
        <div className="flex-shrink-[5] mr-2">
          <div className="flex">
            <button
              className="w-min-content cursor-pointer"
              onClick={onLogoClick}
              aria-label="Home"
            >
              <img
                src="/assets/Azuki-Logo-White.svg"
                alt="Azuki Logo"
                className="h-8 w-auto"
              />
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="items-center hidden lg:flex min-w-0 opacity-100 pointer-events-auto duration-200">
          <div className="flex min-w-0 mt-2">
            {navigationItems.map((item) => (
              <div key={item.label} className="flex flex-col">
                <div className="uppercase w-[fit-content] flex text-xs font-medium flex-row items-center gap-1 py-2 px-3 rounded-full mb-2 select-none duration-[50ms] cursor-pointer text-white hover:bg-white/10 transition-colors">
                  <a href={item.href}>{item.label}</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="z-50 lg:hidden">
          <button
            className={`hamburger ${isMenuOpen ? 'open' : ''}`}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isMenuOpen ? 'visible' : 'hidden'}`}>
          <div className="flex flex-col space-y-6">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="uppercase text-white text-lg font-medium hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)} // Close menu when clicking an item
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              className="uppercase text-white text-lg font-medium hover:text-gray-300 transition-colors border-t border-white/20 pt-6 text-left"
              onClick={() => setIsMenuOpen(false)} // Close menu when clicking CONNECT
            >
              CONNECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AzukiHeader;