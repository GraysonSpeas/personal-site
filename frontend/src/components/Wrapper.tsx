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
  console.log(`[AuthLoadingWrapper] loading:`, loading, new Date().toISOString());
  if (loading) return <LoadingScreen />;
  return <>{children}</>;
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
  const [page, setPage] = useState<Page>(getPageFromPathOrQuery);
  console.log(`[MainContent] initial page:`, page, new Date().toISOString());

  useEffect(() => {
    console.log(`[MainContent] page changed:`, page, new Date().toISOString());
    if (typeof window === "undefined") return;
    if (!SPApages.includes(page)) return; // skip fishing & horizontalgallery
    const desiredPath = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== desiredPath) {
      window.history.pushState(null, "", desiredPath);
      console.log(`[MainContent] pushed history:`, desiredPath);
    }
  }, [page]);

  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [canHideLoader, setCanHideLoader] = useState(false);

  useEffect(() => {
    console.log(
      `[Loader] useLoading:`,
      useLoading,
      "shouldShowLoader:",
      shouldShowLoader,
      "canHideLoader:",
      canHideLoader,
      new Date().toISOString()
    );

    if (!useLoading) {
      setShouldShowLoader(false);
      setCanHideLoader(true);
      return;
    }
    setShouldShowLoader(true);
    setCanHideLoader(true); // immediate hide, no delay
  }, [useLoading]);

  const handleNavigate = (newPage: Page) => {
    console.log(`[MainContent] handleNavigate to:`, newPage, new Date().toISOString());
    setPage(newPage);
  };

  // Optional: log when major components mount
  useEffect(() => {
    console.log("[Hero] component mount", new Date().toISOString());
  }, []);

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
      <AuthLoadingWrapper>
        <MainContent useLoading={useLoading} />
        {children}
      </AuthLoadingWrapper>
    </AuthProvider>
  );
}
