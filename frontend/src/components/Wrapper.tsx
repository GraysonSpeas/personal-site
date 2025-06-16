import React, { useState, useEffect, type ReactNode } from "react";
import Header from "./heropage/Header";
import Hero from "./heropage/Hero";
import MoreInfo from "./heropage/MoreInfo";
import Downloads from "./heropage/Downloads";
import Footer from "./heropage/Footer";
import LoadingScreen from "./heropage/LoadingScreen";
import HorizontalSections from "./horizontal-gallery/HorizontalSections";
import HorizontalHeader from "./horizontal-gallery/HorizontalHeader";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import PlayerButton from "./heropage/PlayerButton";
import type { Page } from "../types/pages";
import FishingPage from "./fishing/FishingPage";

interface WrapperProps {
  useLoading?: boolean;
  children?: ReactNode;
}

function MainContent({ useLoading }: { useLoading: boolean }) {
  const { loading: authLoading } = useAuth();

  // Initialize page state based on current URL pathname
  const [page, setPage] = useState<Page>(() => {
    if (typeof window === "undefined") return "home"; // SSR safe fallback
    console.log("Initial path:", window.location.pathname);
    const path = window.location.pathname.toLowerCase();
    if (path === "/fishing/" || path === "/fishing") return "fishing";
    if (path === "/horizontalgallery") return "horizontalgallery";
    return "home";
  });

  // Optional: sync page state changes to URL (for SPA navigation)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desiredPath = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== desiredPath) {
      window.history.pushState(null, "", desiredPath);
    }
  }, [page]);

  // Full-screen loader timing logic
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [canHideLoader, setCanHideLoader] = useState(false);

 useEffect(() => {
  if (!useLoading) {
    setShouldShowLoader(false);
    setCanHideLoader(true);
    return;
  }

  setShouldShowLoader(true);
  const minDurationTimer = setTimeout(() => {
    setCanHideLoader(true);
  }, 1000);

  return () => clearTimeout(minDurationTimer);
}, [useLoading]);


  // Determine when to show the full-screen loader
  const showFullScreenLoader = useLoading && shouldShowLoader && (authLoading || !canHideLoader);

  // Block rendering page content until auth check is done
  if (authLoading && !showFullScreenLoader) {
    return null;
  }

  // Render full-screen loader if needed
  if (showFullScreenLoader) {
    return <LoadingScreen />;
  }

  const handleNavigate = (newPage: Page) => setPage(newPage);

  return (
    <div
      className={`bg-black min-h-screen text-white overflow-x-hidden relative ${
        page === "horizontalgallery"
          ? "overflow-y-hidden"
          : "overflow-y-auto"
      }`}
    >
      {/* Always-mounted audio player, bottom-left */}
      <div className="fixed bottom-4 left-4 z-50">
        <PlayerButton />
      </div>

      {/* Conditional header */}
      {page === "horizontalgallery" ? (
        <HorizontalHeader
          onLogoClick={() => setPage("home")}
          onNavigate={handleNavigate}
        />
      ) : (
        <Header onNavigate={handleNavigate} />
      )}

      {/* Page content */}
      {page === "fishing" && <FishingPage />}

      {page === "home" && (
        <main>
          <Hero />
          <MoreInfo />
          <Downloads />
          <Footer />
        </main>
      )}

      {page === "horizontalgallery" && <HorizontalSections />}

      {page !== "home" &&
        page !== "horizontalgallery" &&
        page !== "fishing" && (
          <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              🚧 This Page Is Under Construction 🚧
            </h1>
            <button
              onClick={() => setPage("home")}
              className="bg-white text-black font-semibold px-6 py-3 rounded hover:bg-gray-200 transition"
            >
              Return Home
            </button>
          </div>
        )}
    </div>
  );
}

export default function Wrapper({
  useLoading = true,
  children,
}: WrapperProps) {
  return (
    <AuthProvider>
      <MainContent useLoading={useLoading} />
      {children}
    </AuthProvider>
  );
}
