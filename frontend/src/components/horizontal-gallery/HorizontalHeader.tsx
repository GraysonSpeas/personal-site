import React, { useState } from 'react';
import '../../styles/horizontalgallery.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

const HorizontalHeader = ({ onLogoClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Home", page: "home", href: "/" },
    { label: "Horizontal Gallery", page: "horizontalgallery" },
    { label: "Projects", page: "projects" },
    { label: "Fishing", page: "fishing" },
    { label: "Page 2", page: "page2" },
    { label: "Page 3", page: "page3" },
  ];

  return (
    <div className="horizontal-header">
      {/* Logo */}
      <button
        className="logo"
        onClick={onLogoClick}
        aria-label="Home"
      >
        <img
          src="/assets/logo.png"
          alt="Speas Logo"
          className="h-10 md:h-12 w-auto"
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

export default HorizontalHeader;