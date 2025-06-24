import { useState, useEffect, useRef } from "react";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../auth/AuthProvider";
import type { Page } from "../../types/pages";

type MenuItem = {
  label: string;
  page?: Page;
  href?: string;
};

type HeaderProps = {
  onNavigate?: (page: Page) => void;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Home", page: "home", href: "/" },
  { label: "Horizontal Gallery", page: "horizontalgallery"},
  { label: "Projects", page: "projects"},
  { label: "Fishing", page: "fishing", href: "/fishing" },
  { label: "Page 2", page: "page2"},
  { label: "Page 3", page: "page3"}
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "ru", label: "Русский" },
  { code: "zh-CN", label: "简体中文" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
];

/**
 * Set a cookie with name, value, days until expiry, path=/, and optional domain.
 */
function setCookie(name: string, value: string, days: number, domain?: string) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/${domainPart}`;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);

  const { user, logout, loading } = useAuth();

  // -- SCROLL SHADOW EFFECT --
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // -- CLOSE DROPDOWNS WHEN CLICKING OUTSIDE --
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (authModalOpen && containerRef.current && !containerRef.current.contains(tgt)) {
        setAuthModalOpen(false);
      }
      if (langOpen && translateRef.current && !translateRef.current.contains(tgt)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [authModalOpen, langOpen]);

  // -- INJECT GOOGLE TRANSLATE WIDGET ONCE --
  useEffect(() => {
    if (window.google) return; // already loaded

    window.googleTranslateElementInit = () => {
      if (!window.google) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // -- NAVIGATION HANDLER --
  const handleMenuItemClick = (e: React.MouseEvent, item: MenuItem) => {
    if (!item.href && item.page) {
      e.preventDefault();
      onNavigate?.(item.page);
    }
    setMenuOpen(false);
  };

  // -- LANGUAGE SWITCHER: set googtrans cookie and reload --
function deleteCookie(name: string, domain?: string) {
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
}

const changeLanguage = (langCode: string) => {
  const host = window.location.hostname;

  // Delete googtrans cookie on all domain variants
  deleteCookie("googtrans");
  deleteCookie("googtrans", host);
  deleteCookie("googtrans", `.${host}`);

  if ((window as any).changeGoogleTranslateLanguage) {
    (window as any).changeGoogleTranslateLanguage(langCode);
  } else {
    const value = `/en/${langCode}`;
    setCookie("googtrans", value, 365, `.${host}`);
    window.location.replace(window.location.pathname + window.location.search + window.location.hash);
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
          <img src="/assets/logo.png" alt="Site Logo" className="h-10 md:h-12 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href ?? `#${item.page ?? item.label.toLowerCase()}`}
              className="nav-link text-white/90 hover:text-white uppercase font-medium tracking-wider"
              onClick={(e) => handleMenuItemClick(e, item)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Lang & Account */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="relative" ref={translateRef}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="btn btn-outline rounded-full text-sm"
            >
              🌐 Language
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow p-2 z-50">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {/* off-screen mount point for Google */}
            <div id="google_translate_element" className="absolute left-[-9999px]" />
          </div>

          {/* Account dropdown */}
          <div className="relative inline-block" ref={containerRef}>
            <button
              id="auth-toggle-button"
              onClick={() => setAuthModalOpen((o) => !o)}
              className="text-white/90 hover:text-white"
              aria-label="Toggle account modal"
              type="button"
            >
              {/* user icon */}
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
  user ? (
    // ——— Only when user is signed in ———
    <div
      className="absolute top-full right-0 mt-1 z-50 text-black rounded border-0 shadow-none bg-white p-4"
      style={{ minWidth: 300 }}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm">Signed in as</p>
        <p className="font-medium">{user.email.split("@")[0]}</p>
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
    </div>
  ) : (
    // ——— Only when showing Login/Signup ———
    <div
      className="absolute top-full right-0 mt-1 z-50"
      style={{ minWidth: 300 }}
    >
      <AuthModal onClose={() => setAuthModalOpen(false)} inline />
    </div>
  )
)}

          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden relative z-50 flex items-center">
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            {MENU_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href ?? `#${item.page ?? item.label.toLowerCase()}`}
                className="text-white/90 hover:text-white uppercase font-medium py-2"
                onClick={(e) => handleMenuItemClick(e, item)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}