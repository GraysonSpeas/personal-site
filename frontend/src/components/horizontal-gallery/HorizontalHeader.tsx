import React, { useState } from "react";
import "../../styles/horizontalgallery.css";
import type { Page } from "../../types/pages";

interface HeaderProps {
  onLogoClick?: () => void;
  onNavigate?: (page: Page) => void;
}

const navigationItems: { label: string; page: Page; href?: string }[] = [
  { label: "Home", page: "home", href: "/" },
  { label: "Projects", page: "projects" },
  { label: "Fishing", page: "fishing", href: "/fishing" },
  { label: "Page 2", page: "page2" },
  { label: "Page 3", page: "page3" },
];

const HorizontalHeader = ({ onLogoClick, onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (page: Page) => {
    if (onNavigate) onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <div className="horizontal-header">
      {/* Logo */}
      <button className="logo" onClick={onLogoClick} aria-label="Home">
        <img src="/assets/logo.png" alt="Speas Logo" className="h-10 md:h-12 w-auto" />
      </button>

      {/* Navigation menu */}
      <nav className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href ?? `#${item.page}`}
            onClick={(e) => {
              e.preventDefault();
              handleMenuItemClick(item.page);
            }}
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
        className={`hamburger ${isMenuOpen ? "open" : ""}`}
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