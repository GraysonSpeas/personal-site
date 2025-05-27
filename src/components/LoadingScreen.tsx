import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-full h-full absolute top-0 left-0 animated-bg opacity-30" />
      <img
        src="/assets/logo.png"
        alt="Grayson Logo"
        className="h-20 md:h-24 mb-12 relative z-10 animate-pulse"
      />
      <div className="w-64 h-1 bg-gray-800 rounded-full mb-4 relative z-10">
        <div
          className="h-full bg-[#3BA6FF] rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 relative z-10">Loading: {Math.min(100, progress)}%</p>
    </div>
  );
};

export default LoadingScreen;
