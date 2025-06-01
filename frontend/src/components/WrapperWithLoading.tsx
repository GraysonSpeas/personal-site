import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MoreInfo from "./MoreInfo";
import Downloads from "./Downloads";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import { AuthProvider, useAuth } from "./AuthProvider";

interface WrapperWithLoadingProps {
  useLoading?: boolean;
}

function MainContent({ useLoading }: { useLoading: boolean }) {
  const { loading: authLoading } = useAuth();
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [canHideLoader, setCanHideLoader] = useState(false);
  const [authFinished, setAuthFinished] = useState(false);

  useEffect(() => {
    if (!useLoading) {
      setShouldShowLoader(false);
      setCanHideLoader(true);
      return;
    }

    // Show loading screen only if loading takes longer than 200ms
    const delayTimer = setTimeout(() => {
      setShouldShowLoader(true);

      // Once shown, ensure it stays visible for at least 800ms
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

  return showLoader ? (
    <LoadingScreen />
  ) : (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      <Header />
      <main>
        <Hero />
        <MoreInfo />
        <Downloads />
      </main>
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