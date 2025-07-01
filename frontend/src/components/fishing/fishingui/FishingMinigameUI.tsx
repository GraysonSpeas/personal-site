import { useEffect, useState, useRef, useCallback } from 'react'
import { API_BASE } from '../../../config'
import { FishingMinigame } from '../fishinglogic/fishingMinigameLogic'

export function FishingMinigameUI({ refetch }: { refetch: () => void }) {
  type Phase = 'idle' | 'casting' | 'waiting' | 'ready' | 'in-minigame' | 'success' | 'failed'

  const [phase, setPhase] = useState<Phase>('idle')
  const [fishPreview, setFishPreview] = useState<any>(null)
  useEffect(() => {
  console.log('Updated fishPreview:', fishPreview);
}, [fishPreview]);
  const [caughtFish, setCaughtFish] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [castPower, setCastPower] = useState(0)
  const castPowerRef = useRef(0)
  const castDirRef = useRef(1)
  const [feedback, setFeedback] = useState<'Perfect' | 'Good' | 'Ok' | 'Late'>('Ok');
  const [castBonus, setCastBonus] = useState(0)
  const caughtCalledRef = useRef(false)
  const [biteTime, setBiteTime] = useState<number | null>(null)
  const [reactionBonus, setReactionBonus] = useState(0)

  const backendBiteDelayRef = useRef<number>(0)
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getBarStyle = () => {
    const hue = Math.pow(castPower / 100, 1.5) * 110
    return {
      height: `${castPower}%`,
      backgroundColor: `hsl(${hue}, 70%, 60%)`,
    }
  }

  useEffect(() => {
    if (phase !== 'casting') return
    const id = setInterval(() => {
      let p = castPowerRef.current + castDirRef.current * 2
      if (p >= 100) {
        p = 100
        castDirRef.current = -1
      } else if (p <= 0) {
        p = 0
        castDirRef.current = 1
      }
      castPowerRef.current = p
      setCastPower(p)
    }, 20)
    return () => clearInterval(id)
  }, [phase])

  const startFishing = async () => {
    setPhase('casting')
    castPowerRef.current = 0
    setCastPower(0)
    castDirRef.current = 1
    setFeedback('Ok')
    setCaughtFish(null)
    setError(null)
    caughtCalledRef.current = false
    setBiteTime(null)
    setReactionBonus(0)
    backendBiteDelayRef.current = 0

    try {
      const res = await fetch(`${API_BASE}/minigame/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const errText = await res.text()
        console.log('Start fishing error response:', errText)
        throw new Error('Failed to start')
      }
      const json = await res.json()
      console.log(json)
      setFishPreview(json.fishPreview)
      backendBiteDelayRef.current = json.biteDelay || 4000
    } catch (e: any) {
      console.log('Start fishing error:', e.message)
      setPhase('idle')
      setError(e.message)
    }
  }

const handleCast = () => {
  let bonus = 0;
  let txt: 'Perfect' | 'Good' | 'Ok' | 'Late' = 'Late';

  const power = castPowerRef.current;

  if (power >= 95) {
    bonus = 20;
    txt = 'Perfect';
  } else if (power >= 85) {
    bonus = 10;
    txt = 'Good';
  } else if (power >= 60) {
    bonus = 5;
    txt = 'Ok';
  }

  setFeedback(txt);
  setCastBonus(bonus);
  setPhase('waiting');
  setBiteTime(Date.now() + backendBiteDelayRef.current);
};


  const catchFish = () => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current)
      reactionTimeoutRef.current = null
    }
    setPhase('in-minigame')
  }

  const onResult = useCallback(
    async (result: 'caught' | 'escaped') => {
      if (caughtCalledRef.current) return
      caughtCalledRef.current = true
      if (!fishPreview) {
        setPhase('idle')
        caughtCalledRef.current = false
        return
      }
      if (result === 'caught') {
        try {
          const res = await fetch(`${API_BASE}/minigame/catch`, {
            method: 'POST',
            credentials: 'include',
          })
          const json = await res.json()
          console.log('Catch response:', json);
          if (!res.ok) throw new Error(json.error || 'Failed to catch')
          setCaughtFish(json.fish)
          setPhase('success')
          await refetch()
        } catch (e: any) {
          setError(e.message)
          setPhase('failed')
        }
      } else {
        setPhase('failed')
      }
      setFishPreview(null)
      setCastBonus(0)
      setReactionBonus(0)
    },
    [fishPreview, refetch]
  )

  // Manage bite and reaction timing phases
  useEffect(() => {
    if (phase !== 'waiting' || !biteTime) return
    const now = Date.now()
    const timeToBite = biteTime - now
    if (timeToBite > 0) {
      const biteTimeout = setTimeout(() => {
        setPhase('ready')
      }, timeToBite)
      return () => clearTimeout(biteTimeout)
    } else {
      setPhase('ready')
    }
  }, [biteTime, phase])

  // Reaction window: 4 seconds to react after ready
  useEffect(() => {
    if (phase !== 'ready' || !biteTime) return

    reactionTimeoutRef.current = setTimeout(() => {
      // Over 4 seconds: fish escapes
      onResult('escaped')
    }, 4000)

    return () => {
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current)
        reactionTimeoutRef.current = null
      }
    }
  }, [phase, biteTime, onResult])

  // Space key controls
  useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== ' ') return
    e.preventDefault()
    if (phase === 'idle') startFishing()
    else if (phase === 'casting') handleCast()
    else if (phase === 'ready') {
      if (!biteTime) return

      const reactionTime = Date.now() - biteTime

      if (reactionTime <= 1500) setReactionBonus(10)
      else if (reactionTime <= 4000) setReactionBonus(0)
      else {
        onResult('escaped')
        return
      }
      catchFish()
    }
    else if (phase === 'success' || phase === 'failed') {
      setPhase('idle')
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [phase, biteTime, onResult])

  const feedbackColorClass = {
    Perfect: 'text-green-400',
    Good: 'text-blue-400',
    Ok: 'text-yellow-400',
    Late: 'text-red-500',
  }[feedback]

  return (
    <div className="space-y-4">
      {phase === 'idle' && (
        <button
          onClick={startFishing}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Fish
        </button>
      )}

      {phase === 'casting' && (
        <div className="w-16 mx-auto flex flex-col items-center">
          <p className="mb-2 text-center">Press space to cast!</p>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 200,
              border: '2px solid #333',
              backgroundColor: '#e5e7eb',
              borderRadius: 6,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 2,
                transition:
                  phase === 'casting'
                    ? 'none'
                    : 'height 0.1s linear, background-color 0.1s linear',
                ...getBarStyle(),
              }}
            />
          </div>
        </div>
      )}

      {(phase === 'waiting' || phase === 'ready') && (
        <div className="text-center space-y-1">
          <p className={`font-bold ${feedbackColorClass}`}>
            {feedback} ({castPower.toFixed(1)}%)
          </p>

          <p>
  {phase === 'waiting' 
    ? 'Waiting for a bite…' 
    : <>Fish is biting! <strong>Press space quickly!</strong></>}
</p>
        </div>
      )}

      {phase === 'in-minigame' && fishPreview && (
        <FishingMinigame
  fish={fishPreview.data}
  onResult={onResult}
  castBonus={castBonus}        // pass separately
  reactionBonus={reactionBonus}            // pass separately
  playerFocus={fishPreview?.gearStats?.focus ?? 50}
  playerLineTension={fishPreview?.gearStats?.lineTension ?? 50}
  isResource={fishPreview.isResource}
/>
      )}

      {phase === 'success' && caughtFish && (
        <div className="text-center space-y-2">
          <p>
            🎉 You caught a {caughtFish.species} ({caughtFish.rarity})!
          </p>
          <button
            onClick={() => setPhase('idle')}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Catch Again
          </button>
        </div>
      )}

      {phase === 'failed' && (
        <div className="text-center space-y-2">
          <p>😢 The fish got away.</p>
          <button
            onClick={() => setPhase('idle')}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  )
}