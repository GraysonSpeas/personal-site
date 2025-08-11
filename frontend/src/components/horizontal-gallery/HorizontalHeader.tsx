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

  const handleMenuItemClick = (item: { label: string; page: Page; href?: string }) => {
    const currentPath = window.location.pathname.toLowerCase();

    // Going TO fishing: full reload
    if (item.page === "fishing") {
      window.location.href = item.href!;
      return;
    }

    // FROM fishing TO SPA page: reload root with query param for SPA to handle page
    if (currentPath.startsWith("/fishing")) {
      window.location.href = `/?page=${item.page}`;
      return;
    }

    // Otherwise SPA navigation
    if (onNavigate) onNavigate(item.page);
    setIsMenuOpen(false);
  };

  return (
    <div className="horizontal-header">
      {/* Logo */}
      <button className="logo" onClick={onLogoClick} aria-label="Home">
        <img
          src="/assets/logo.png"
          alt="Speas Logo"
          className="h-10 md:h-12 w-auto transition duration-300 filter hover:brightness-110 hover:drop-shadow-[0_0_2px_rgba(252,211,77,0.5)] hover:scale-110"
        />
      </button>

      {/* Navigation menu */}
      <nav className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href ?? `#${item.page}`}
            onClick={(e) => {
              e.preventDefault();
              handleMenuItemClick(item);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Hamburger */}
      <button
        className={`hamburger ${isMenuOpen ? "open" : ""} transition duration-300 transform hover:brightness-110 hover:drop-shadow-[0_0_2px_rgba(252,211,77,0.5)] hover:scale-110`}
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