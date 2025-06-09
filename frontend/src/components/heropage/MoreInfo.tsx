const GameInfo = () => {
  const features = [
    {
      title: "Learning",
      description: "Something about learning",
      icon: "📚",
    },
    {
      title: "Technical Stack",
      description: "Something about the technical stack",
      icon: "💻",
    },
    {
      title: "Im out of ideas",
      description: "Something about being out of ideas",
      icon: "🤷‍♂️",
    },
    {
      title: "I'm really out of ideas",
      description: "Something about being really out of ideas",
      icon: "😅",
    },
  ];

  return (
    <section id="about" className="py-24 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="game-title text-4xl md:text-5xl mb-6 text-white">
            MoreInfo
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            This is random text
          </p>
        </div>

        {/* Character Showcase */}
        <div className="relative mb-24 overflow-hidden rounded-lg">
          <img
            src="/assets/footer_photo.jpg"
            alt="Mountain"
            className="w-full h-auto rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
            <h3 className="game-title text-2xl md:text-3xl mb-2 text-white">Look at this mountain</h3>
            <p className="text-white/80 max-w-xl">
              I went unique places and saw unique things. This is a mountain.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 bg-gray-900/60 rounded-lg border border-gray-800 hover:border-[#3BA6FF]/50
              transition-all duration-300 hover:bg-gray-900/80 backdrop-filter backdrop-blur-sm"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameInfo;
