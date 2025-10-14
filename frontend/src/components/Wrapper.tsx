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

// Loader overlay: page renders immediately, loader sits on top
function AuthLoadingOverlay({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  console.log(`[AuthLoadingOverlay] loading:`, loading, new Date().toISOString());

  return (
    <>
      {children}                   {/* render page immediately */}
      {loading && <LoadingScreen />} {/* overlay loader */}
    </>
  );
}

const SPApages = ["home", "projects", "page2", "page3"];

function getPageFromPathOrQuery(): Page {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.toLowerCase();

  if (path === "/fishing" || path === "/fishing/") return "fishing";
  if (path === "/horizontalgallery") return "horizontalgallery";

  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");
  if (pageParam && (SPApages.includes(pageParam) || pageParam === "horizontalgallery"))
    return pageParam as Page;

  const segment = path.split("/")[1];
  if (SPApages.includes(segment)) return segment as Page;

  return "home";
}

const MainContent = memo(function MainContent({ useLoading }: { useLoading: boolean }) {
  const [page, setPage] = useState<Page>("home");
  const [mounted, setMounted] = useState(false);

  const handleNavigate = (newPage: Page) => setPage(newPage);

  // Run only on client after mount
  useEffect(() => {
    setPage(getPageFromPathOrQuery());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!SPApages.includes(page)) return; // skip fishing & horizontalgallery
    const desiredPath = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== desiredPath) {
      window.history.pushState(null, "", desiredPath);
    }
  }, [page, mounted]);

  // Show nothing until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div
      className={`bg-black min-h-screen text-white overflow-x-hidden relative ${
        page === "horizontalgallery" ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      <div className="fixed bottom-4 left-4 z-50">
        <PlayerButton />
      </div>

      {page === "horizontalgallery" || page === "fishing" ? (
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

      {page !== "home" &&
        page !== "horizontalgallery" &&
        page !== "fishing" &&
        SPApages.includes(page) && (
          <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {`🚧 ${page} Page Is Under Construction 🚧`}
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
});

export default function Wrapper({ useLoading = true, children }: WrapperProps) {
  console.log("[Wrapper] mount", new Date().toISOString());
  return (
    <AuthProvider>
      <AuthLoadingOverlay>
        <MainContent useLoading={useLoading} />
        {children}
      </AuthLoadingOverlay>
    </AuthProvider>
  );
}