import { useState, useEffect } from "react";
import styles from "./Hero.module.css";

const Hero = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/video_bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      </div>

      {/* Foreground Elements */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="text-center px-4">
          <h1
            className={`${styles.pageTitle} ${styles.glow} text-4xl md:text-7xl lg:text-8xl`}
            style={{ transform: `translateY(${offset * 0.2}px)` }}
          >
            Grayson Speas
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8"
            style={{ transform: `translateY(${offset * 0.15}px)` }}
          >
            Hello
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
            style={{ transform: `translateY(${offset * 0.1}px)` }}
          >
            <button className="btn btn-primary min-w-36">Resume</button>
            <button className="btn btn-outline min-w-36">More Info</button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;