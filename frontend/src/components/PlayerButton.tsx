import React, { useState, useEffect, useRef } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";

export default function PlayerButton() {
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {});
        setMuted(false);
        setHasInteracted(true);
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (!muted) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [muted]);

  // <-- Add this new useEffect to set the initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // volume of music
    }
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/past_sadness.mp3"
        loop
        preload="auto"
        autoPlay
        muted
      />
      <button
        onClick={() => setMuted(!muted)}
        aria-label={muted ? "Unmute music" : "Mute music"}
        className="flex items-center justify-center p-1 rounded-full hover:text-green-400 transition"
      >
        {muted ? (
          <SpeakerXMarkIcon className="w-5 h-5 text-white" />
        ) : (
          <SpeakerWaveIcon className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  );
}
