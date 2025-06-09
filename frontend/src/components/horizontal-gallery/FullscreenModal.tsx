import { useEffect } from "react";

interface FullscreenModalProps {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  onClose: () => void;
}

const worldDescriptions: Record<string, string> = {
  Panel1: "description for Panel 1",
  Panel2: "description for Panel 2",
  Panel3: "description for Panel 3",
  Panel4: "description for Panel 4",
  Panel5: "description for Panel 5",
};

export const FullscreenModal = ({
  isOpen,
  imageSrc,
  title,
  onClose,
}: FullscreenModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const description =
    worldDescriptions[title] ||
    "Discover the mysteries and adventures that await in this unique corner of the universe.";

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute top-[64px] left-0 right-0 bottom-0 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full bg-[#121214] border-4 border-white rounded-lg overflow-hidden animate-modal-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 border border-white/30 hover:border-white rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121214]/90 via-transparent to-[#121214]/50">
            <div className="flex flex-col justify-end h-full p-8 md:p-12">
              <h1 className="font-msbee font-black uppercase text-6xl md:text-8xl text-white mb-4">
                {title.toLowerCase()}
              </h1>

              <div className="max-w-2xl mb-8">
                <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-6">
                  {description}
                </p>

                <div className="flex gap-4 flex-wrap">
                  <a
                    href="#"
                    className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-full font-medium uppercase tracking-wide transition-all duration-200 hover:scale-105"
                  >
                    Explore {title}
                  </a>
                  <button
                    onClick={onClose}
                    className="bg-transparent border border-white/30 hover:border-white text-white hover:bg-white/10 px-6 py-3 rounded-full font-medium uppercase tracking-wide transition-all duration-200"
                  >
                    Back to Panels
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};