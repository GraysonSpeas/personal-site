import React, { useState, useEffect, type ReactNode, memo } from "react";
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

function AuthLoadingWrapper({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <>{children}</>;
}

const MainContent = memo(function MainContent({ useLoading }: { useLoading: boolean }) {
  // Removed useAuth here to avoid rerenders on auth state changes

  const [page, setPage] = useState<Page>(() => {
    if (typeof window === "undefined") return "home";
    const path = window.location.pathname.toLowerCase();
    if (path === "/fishing/" || path === "/fishing") return "fishing";
    if (path === "/horizontalgallery") return "horizontalgallery";
    return "home";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const desiredPath = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== desiredPath) {
      window.history.pushState(null, "", desiredPath);
    }
  }, [page]);

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

  const handleNavigate = (newPage: Page) => setPage(newPage);

  return (
    <div
      className={`bg-black min-h-screen text-white overflow-x-hidden relative ${
        page === "horizontalgallery" ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      <div className="fixed bottom-4 left-4 z-50">
        <PlayerButton />
      </div>

      {page === "horizontalgallery" ? (
        <HorizontalHeader onLogoClick={() => setPage("home")} onNavigate={handleNavigate} />
      ) : (
        <Header onNavigate={handleNavigate} />
      )}

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

      {page !== "home" && page !== "horizontalgallery" && page !== "fishing" && (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">🚧 This Page Is Under Construction 🚧</h1>
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
});

export default function Wrapper({ useLoading = true, children }: WrapperProps) {
  return (
<AuthProvider>
  <AuthLoadingWrapper>
    <MainContent useLoading={useLoading} />
    {children}
  </AuthLoadingWrapper>
</AuthProvider>

  );
}