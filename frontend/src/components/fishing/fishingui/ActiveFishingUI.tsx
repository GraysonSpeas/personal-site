import React, { useEffect } from 'react';

interface Fish {
  name: string;
}

interface ActiveFishingUIProps {
  activePhase: 'idle' | 'casting' | 'bite-ready' | 'in-minigame' | 'success' | 'failed';
  stamina: number;
  balance: number;
  fishTugDirection: 'left' | 'right';
  fishTugStrength?: number;
  caughtFish: Fish | null;
  error?: string | null;
  startActive: () => void;
  reactActive: () => void;
  loading?: boolean;
}

export function ActiveFishingUI({
  activePhase,
  stamina,
  balance,
  fishTugDirection,
  fishTugStrength = 0,
  caughtFish,
  error = null,
  startActive,
  reactActive,
  loading = false,
}: ActiveFishingUIProps) {
  useEffect(() => {
    const onSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activePhase === 'bite-ready') {
        e.preventDefault();
        reactActive();
      }
    };
    window.addEventListener('keydown', onSpace);
    return () => window.removeEventListener('keydown', onSpace);
  }, [activePhase, reactActive]);

  const getStaminaColor = (value: number) => {
    if (value < 60) return 'bg-red-500';
    if (value < 90) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  return (
    <section
      className="border rounded p-4 space-y-4 w-80 bg-white dark:bg-gray-800 shadow-md"
      aria-labelledby="fishing-title"
      role="region"
      aria-live="polite"
    >
      <h3
        id="fishing-title"
        className="font-semibold text-lg text-gray-900 dark:text-gray-100"
      >
        Active Fishing Minigame
      </h3>

      {error && (
        <p className="text-red-600 font-semibold" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      {loading ? (
        <p
          className="text-indigo-500 font-medium text-center animate-pulse"
          aria-live="polite"
          role="status"
        >
          Preparing your fishing rod...
        </p>
      ) : (
        <>
          {activePhase === 'idle' && (
            <button
              onClick={startActive}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-600"
              aria-label="Cast bobber to start fishing"
            >
              Cast Bobber
            </button>
          )}

          {activePhase === 'casting' && (
            <p
              className="text-blue-500 font-medium animate-pulse text-center"
              aria-live="polite"
              role="status"
            >
              🎣 Bobber in water...
            </p>
          )}

          {activePhase === 'bite-ready' && (
            <button
              onClick={reactActive}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring focus:ring-yellow-300 dark:focus:ring-yellow-600"
              aria-label="Reel in the fish"
            >
              Reel In! <span className="ml-2">(Space)</span>
            </button>
          )}

          {activePhase === 'in-minigame' && (
            <>
              {/* Fish Stamina */}
              <div>
                <label
                  htmlFor="stamina-bar"
                  className="block font-semibold mb-1 text-gray-800 dark:text-gray-200"
                >
                  Fish Stamina
                </label>
                <div
                  id="stamina-bar"
                  className="w-full bg-gray-300 dark:bg-gray-700 rounded h-6 relative"
                  role="progressbar"
                  aria-valuenow={stamina}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Fish stamina"
                >
                  <div
                    className={`${getStaminaColor(stamina)} h-6 rounded transition-all duration-150`}
                    style={{ width: `${stamina}%` }}
                  />
                </div>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {stamina.toFixed(0)} / 100 — catch at 100!
                </p>
              </div>

{/* Tug Balance */}
<div>
  <label
    htmlFor="balance-indicator"
    className="block font-semibold mb-1 text-gray-800 dark:text-gray-200"
  >
    Tug Balance
  </label>
  <div
    id="balance-indicator"
    className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-400"
  >
    <span>Left</span>
    <span>Right</span>
  </div>
  <div
    className="relative h-4 w-full rounded mt-2 overflow-hidden"
    role="progressbar"
    aria-valuenow={balance}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Tug balance"
    style={{
      background: `linear-gradient(to right,
        #ef4444 0%,
        #facc15 15%,
        #facc15 35%,
        #22c55e 35%,
        #22c55e 65%,
        #facc15 65%,
        #facc15 85%,
        #ef4444 100%)`
    }}
  >
    <div
      className="absolute top-0 h-full w-5 rounded bg-indigo-500 dark:bg-indigo-300 z-10 transition-all duration-200"
      style={{ left: `calc(${balance}% - 3px)` }}
    />
  </div>
</div>
            </>
          )}

          {(activePhase === 'success' || activePhase === 'failed') && (
            <div className="text-center space-y-3" role="alert" aria-live="assertive">
              {activePhase === 'success' && caughtFish && (
                <p className="text-green-700 font-bold text-lg animate-bounce">
                  🎉 You caught a <span className="underline">{caughtFish.name}</span>!
                </p>
              )}
              {activePhase === 'failed' && (
                <p className="text-red-600 font-semibold">😢 The fish got away.</p>
              )}
              <button
                onClick={startActive}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-600"
                aria-label={activePhase === 'success' ? 'Catch again' : 'Try again'}
              >
                {activePhase === 'success' ? 'Catch Again' : 'Try Again'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}