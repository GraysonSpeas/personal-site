import { useState, useEffect, useRef } from "react";
import PlayerButton from "./PlayerButton";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthProvider";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user, logout, loading } = useAuth();

  const menuItems = [
    "Home",
    "Resume",
    "Projects",
    "For Fun",
    "Random",
    "Pictures",
  ];

  // Handle scroll background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close auth modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        authModalOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAuthModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [authModalOpen]);

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
        <a href="/" className="flex items-center">
          <img src="/assets/logo.png" alt="Site Logo" className="h-10 md:h-12" />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
              className="nav-link text-white/90 hover:text-white uppercase font-medium tracking-wider"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center gap-4">
          <PlayerButton />
          <button className="btn btn-outline rounded-full text-sm">English</button>

          {/* Account icon + modal */}
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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
              d={
                menuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg py-4 px-4 absolute top-full left-0 w-full">
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                className="nav-link text-white/90 hover:text-white uppercase font-medium tracking-wider"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;