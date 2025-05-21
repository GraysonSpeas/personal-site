const Downloads = () => {
  const platforms = [
    {
      name: "App Store",
      icon: (
        <svg viewBox="0 0 384 512" className="w-6 h-6 fill-current">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
      ),
      link: "#app-store",
    },
    {
      name: "Google Play",
      icon: (
        <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current">
          <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
        </svg>
      ),
      link: "#google-play",
    },
    {
      name: "Epic Games",
      icon: (
        <svg viewBox="0 0 227.2 256" className="w-6 h-6 fill-current">
          <path d="M180.6,256h-79.1c-2.4,0-4.3-1.9-4.3-4.3c0-2.4,1.9-4.3,4.3-4.3h79.1c2.4,0,4.3,1.9,4.3,4.3
            C184.9,254.1,182.9,256,180.6,256z M152.2,64h75l-30.7,43l30.7,42.7h-45.7l-29.3-42.7L152.2,64z M75.1,28.6L0,149.7h24.4
            l16.4-27.3h63.5l-11.4,27.3h24.4l42.8-121.1L75.1,28.6z M49.8,99.1l20.7-34.4l9.3,34.4H49.8z" />
        </svg>
      ),
      link: "#epic-games",
    },
    {
      name: "Windows",
      icon: (
        <svg viewBox="0 0 448 512" className="w-6 h-6 fill-current">
          <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" />
        </svg>
      ),
      link: "#windows",
    },
  ];

  return (
    <section className="py-20 relative bg-[#061428]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/footer_bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-[#061428]/60 backdrop-blur-sm" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="game-title text-4xl md:text-5xl mb-6 text-white">
            What even goes here
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            I need to put stuff here
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
          <div className="bg-white p-4 rounded-lg">
            <img
              src="/assets/qr.png"
              alt="Download QR Code"
              className="w-40 h-40"
            />
          </div>
          <div className="text-left max-w-sm">
            <h3 className="text-2xl font-bold mb-3 text-white">Scan to Download</h3>
            <p className="text-white/80 mb-4">
              Scan the QR code with your mobile device.
            </p>
            <a
              href="#scan-instructions"
              className="text-[#3BA6FF] hover:text-[#2196f3] flex items-center"
            >
              How to scan
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 ml-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Platform Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform, index) => (
            <a
              key={platform.name}
              href={platform.link}
              className="p-4 bg-black/40 border border-gray-800 rounded-lg flex items-center justify-center
              hover:bg-black/60 hover:border-[#3BA6FF]/50 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center mb-2 text-white/80 group-hover:text-[#3BA6FF]">
                  {platform.icon}
                </div>
                <span className="text-white/90 group-hover:text-white">
                  {platform.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Downloads;
