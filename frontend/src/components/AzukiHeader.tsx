import React, { useState } from 'react';
import '../styles/azuki.css';

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
    <div className="azuki-header">
      {/* Logo */}
      <button
        className="logo"
        onClick={onLogoClick}
        aria-label="Home"
      >
        <img
          src="/assets/logo.png"
          alt="Azuki Logo"
          className="h-8 w-auto"
        />
      </button>

      {/* Navigation menu */}
      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <button onClick={() => setIsMenuOpen(false)} className="btn-primary">
          CONNECT
        </button>
      </nav>

      {/* Hamburger */}
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
  );
};

export default AzukiHeader;