import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MoreInfo from "./MoreInfo";
import Downloads from "./Downloads";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";

export default function WrapperWithLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
