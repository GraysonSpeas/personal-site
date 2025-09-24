import React, { useState, useRef, useEffect } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const currentPath = window.location.pathname.toLowerCase();

  // Hide Fishing + add Horizontal Gallery when on /fishing
  const filteredItems = navigationItems
    .filter(
      (item) => !(currentPath.startsWith("/fishing") && item.page === "fishing")
    )
    .concat(
      currentPath.startsWith("/fishing")
        ? [
            {
              label: "Horizontal Gallery",
              page: "horizontalgallery" as Page,
              // note: still root, SPA picks up ?page=horizontalgallery
              href: "/?page=horizontalgallery",
            },
          ]
        : []
    );

  const handleMenuItemClick = (item: { label: string; page: Page; href?: string }) => {
    const current = window.location.pathname.toLowerCase();

    if (item.page === "fishing") {
      // full reload to fishing
      window.location.href = item.href!;
      return;
    }

    if (current.startsWith("/fishing")) {
      // return to SPA root with query so home app can show correct section
      window.location.href =
        item.page === "horizontalgallery"
          ? "/?page=horizontalgallery"
          : `/?page=${item.page}`;
      return;
    }

    // normal SPA navigation
    if (onNavigate) onNavigate(item.page);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="horizontal-header" ref={menuRef}>
      {/* Logo */}
      <button className="logo" onClick={onLogoClick} aria-label="Home">
        <img
          src="/assets/logo.png"
          alt="Speas Logo"
          className="h-10 md:h-12 w-auto transition duration-300 filter hover:brightness-110 hover:drop-shadow-[0_0_2px_rgba(252,211,77,0.5)] hover:scale-110"
        />
      </button>

      {/* Navigation */}
      <nav className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
        {filteredItems.map((item) => (
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