import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MoreInfo from "./MoreInfo";
import Downloads from "./Downloads";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import PlayerButton from "./PlayerButton";

interface WrapperWithLoadingProps {
  useLoading?: boolean;
}

export default function WrapperWithLoading({ useLoading = true }: WrapperWithLoadingProps) {
  const [loading, setLoading] = useState(useLoading);

  useEffect(() => {
    if (useLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [useLoading]);

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <Header />
          <main>
            <Hero />
            <MoreInfo />
            <Downloads />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
