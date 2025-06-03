import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MoreInfo from "./MoreInfo";
import Downloads from "./Downloads";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import AzukiWorld from "./AzukiWorld";
import { AuthProvider, useAuth } from "./AuthProvider";
import type { Page } from "../types/pages";
import AzukiHeader from "./AzukiHeader";

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

  // Single handler for navigation, passed to Header
  const handleNavigate = (page: Page) => {
    setPage(page);
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      {/* Pass the onNavigate handler */}
      {page === "azuki" ? (
  <AzukiHeader onLogoClick={() => setPage("home")} />
) : (
  <Header onNavigate={handleNavigate} />
)}


      {page === "home" && (
        <main>
          <Hero />
          <MoreInfo />
          <Downloads />
        </main>
      )}

      {page === "azuki" && <AzukiWorld />}

      <Footer />
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