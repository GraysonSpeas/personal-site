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