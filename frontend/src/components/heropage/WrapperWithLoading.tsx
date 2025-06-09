import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MoreInfo from "./MoreInfo";
import Downloads from "./Downloads";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import HorizontalSections from "../horizontal-gallery/HorizontalSections";
import HorizontalHeader from "../horizontal-gallery/HorizontalHeader";
import { AuthProvider, useAuth } from "../auth/AuthProvider";
import PlayerButton from "./PlayerButton"; // <-- import PlayerButton
import type { Page } from "../../types/pages";
import FishingPage from "../fishing/FishingPage"; // <-- import FishingPage

interface WrapperWithLoadingProps {
  useLoading?: boolean;
}

function MainContent({ useLoading }: { useLoading: boolean }) {
  const { loading: authLoading } = useAuth();
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [canHideLoader, setCanHideLoader] = useState(false);
  const [authFinished, setAuthFinished] = useState(false);
  const [page, setPage] = useState<Page>("home");

  useEffect(() => {
    if (!useLoading) {
      setShouldShowLoader(false);
      setCanHideLoader(true);
      return;
    }

    const delayTimer = setTimeout(() => {
      setShouldShowLoader(true);
      const minDurationTimer = setTimeout(() => {
        setCanHideLoader(true);
      }, 800);

      return () => clearTimeout(minDurationTimer);
    }, 200);

    return () => clearTimeout(delayTimer);
  }, [useLoading]);

  useEffect(() => {
    if (!authLoading) {
      setAuthFinished(true);
    }
  }, [authLoading]);

  const showLoader = shouldShowLoader && (!authFinished || !canHideLoader);

  if (showLoader) {
    return <LoadingScreen />;
  }

  const handleNavigate = (page: Page) => {
    setPage(page);
  };

  return (
  <div
    className={`bg-black min-h-screen text-white overflow-x-hidden relative ${
      page === "horizontalgallery" ? "overflow-y-hidden" : "overflow-y-auto"
    }`}
  >
    {/* Always-mounted audio player, bottom-left */}
    <div className="fixed bottom-4 left-4 z-50">
      <PlayerButton />
    </div>

    {/* Conditional header */}
    {page === "horizontalgallery" ? (
      <HorizontalHeader onLogoClick={() => setPage("home")} />
    ) : (
      <Header onNavigate={handleNavigate} />
    )}

    {page === "fishing" && <FishingPage />}

    {/* Main body based on page */}
    {page === "home" && (
      <main>
        <Hero />
        <MoreInfo />
        <Downloads />
        <Footer />
      </main>
    )}

    {page === "horizontalgallery" && <HorizontalSections />}

    {/* Catch-all for other pages */}
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

}

export default function WrapperWithLoading({ useLoading = true }: WrapperWithLoadingProps) {
  return (
    <AuthProvider>
      <MainContent useLoading={useLoading} />
    </AuthProvider>
  );
}