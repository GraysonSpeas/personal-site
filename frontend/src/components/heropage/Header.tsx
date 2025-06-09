import { useState, useEffect, useRef } from "react";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../auth/AuthProvider";
import type { Page } from "../../types/pages";

type MenuItem = {
  label: string;
  page?: Page;     // internal SPA page navigation
  href?: string;   // external link or fallback anchor
};

type HeaderProps = {
  onNavigate?: (page: Page) => void;
};

const Header = ({ onNavigate }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user, logout, loading } = useAuth();

  const menuItems: MenuItem[] = [
    { label: "Home", page: "home", href: "/" },
    { label: "Horizontal Gallery", page: "horizontalgallery" },
    { label: "Projects", page: "projects" },
    { label: "Page 1", page: "page1" },
    { label: "Page 2", page: "page2" },
    { label: "Page 3", page: "page3" },
  ];

  // Scroll effect to toggle header background & padding
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close auth modal on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        authModalOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAuthModalOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [authModalOpen]);

  // Handle navigation clicks for SPA or external
  const handleMenuItemClick = (e: React.MouseEvent, item: MenuItem) => {
    if (item.page) {
      e.preventDefault();
      onNavigate?.(item.page);
      setMenuOpen(false);
    } else if (item.href) {
      setMenuOpen(false);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50"
      style={{
        background: scrolled
          ? "linear-gradient(to bottom, rgba(0,0,0,.95), rgba(0,0,0,.7))"
          : "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))",
        padding: scrolled ? "0.4rem 1rem" : "1rem 1rem 2.5rem",
        transition: "background 0.5s ease, padding 0.5s ease",
      }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.("home");
            setMenuOpen(false);
          }}
        >
          <img
            src="/assets/logo.png"
            alt="Site Logo"
            className="h-10 md:h-12 w-auto max-w-none shrink-0"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {menuItems.map((item) => {
            const href =
              item.href ?? `#${item.page ?? item.label.toLowerCase()}`;
            return (
              <a
                key={item.label}
                href={href}
                className="nav-link text-white/90 hover:text-white uppercase font-medium tracking-wider"
                onClick={(e) => handleMenuItemClick(e, item)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right side buttons (no PlayerButton) */}
        <div className="hidden md:flex items-center gap-4">
          <button className="btn btn-outline rounded-full text-sm">
            English
          </button>

          {/* Account icon and modal */}
          <div className="relative inline-block" ref={containerRef}>
            <button
              onClick={() => setAuthModalOpen((prev) => !prev)}
              className="text-white/90 hover:text-white"
              aria-label="Toggle account modal"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>

            {authModalOpen && (
              <div
                className="absolute top-full right-0 mt-1 z-50 bg-white text-black rounded shadow p-4"
                style={{ minWidth: "300px" }}
              >
                {loading ? (
                  <p className="text-sm text-center">Loading...</p>
                ) : user ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">Signed in as</p>
                    <p className="font-medium">{user.email}</p>
                    <button
                      onClick={() => {
                        logout();
                        setAuthModalOpen(false);
                      }}
                      className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <AuthModal onClose={() => setAuthModalOpen(false)} inline />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger + Top-Right Menu */}
        <div className="md:hidden relative z-50 flex items-center">
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            {menuItems.map((item) => {
              const href =
                item.href ?? `#${item.page ?? item.label.toLowerCase()}`;
              return (
                <a
                  key={item.label}
                  href={href}
                  className="text-white/90 hover:text-white uppercase font-medium py-2"
                  onClick={(e) => handleMenuItemClick(e, item)}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;