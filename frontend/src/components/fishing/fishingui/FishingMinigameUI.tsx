import { useEffect, useState, useRef, useCallback } from 'react'
import { API_BASE } from '../../../config'
import { FishingMinigame } from '../fishinglogic/fishingMinigameLogic'

export function FishingMinigameUI({ refetch }: { refetch: () => void }) {
  type Phase = 'idle' | 'casting' | 'waiting' | 'ready' | 'in-minigame' | 'success' | 'failed'

  const [phase, setPhase] = useState<Phase>('idle')
  const [fishPreview, setFishPreview] = useState<any>(null)
  const [caughtFish, setCaughtFish] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [castPower, setCastPower] = useState(0)
  const castPowerRef = useRef(0)
  const castDirRef = useRef(1)
  const [feedback, setFeedback] = useState<'Perfect' | 'Good' | 'Ok'>('Ok')
  const castBonusRef = useRef(0)
  const caughtCalledRef = useRef(false)
  const [biteTime, setBiteTime] = useState<number | null>(null)

  // Pastel color bar with smooth height and color transitions
  const getBarStyle = () => {
    const hue = (castPower / 100) * 120 // 0=red → 120=green
    return {
      height: `${castPower}%`,
      backgroundColor: `hsl(${hue}, 80%, 70%)`, // pastel colors
      transition: 'height 0.1s linear, background-color 0.1s linear',
    }
  }

  // Speed up bar ramp: step 1.2 every 20ms
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
    try {
      const res = await fetch(`${API_BASE}/minigame/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to start')
      const { fishPreview } = await res.json()
      setFishPreview(fishPreview)
    } catch (e: any) {
      setPhase('idle')
      setError(e.message)
    }
  }

  const handleCast = () => {
    let bonus = 0,
      txt: 'Perfect' | 'Good' | 'Ok' = 'Ok'
    if (castPowerRef.current >= 90) {
      bonus = 20
      txt = 'Perfect'
    } else if (castPowerRef.current >= 60) {
      bonus = 10
      txt = 'Good'
    }
    setFeedback(txt)
    castBonusRef.current = bonus
    setPhase('waiting')
    const delay = 4000 + Math.random() * 4000
    setTimeout(() => {
      setPhase('ready')
      setBiteTime(Date.now())
    }, delay)
  }

  const catchFish = () => setPhase('in-minigame')

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
      castBonusRef.current = 0
    },
    [fishPreview, refetch]
  )

  useEffect(() => {
    if (phase !== 'ready' || !biteTime) return
    const id = setTimeout(() => onResult('escaped'), 4000)
    return () => clearTimeout(id)
  }, [phase, biteTime, onResult])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ') return
      e.preventDefault()
      if (phase === 'idle') startFishing()
      else if (phase === 'casting') handleCast()
      else if (phase === 'ready') {
        if (Date.now() - (biteTime || 0) <= 1500) castBonusRef.current += 20
        catchFish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, biteTime])

  // Feedback color classes
  const feedbackColorClass = {
    Perfect: 'text-green-400',
    Good: 'text-blue-400',
    Ok: 'text-yellow-400',
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
    height: `${Math.min(castPowerRef.current * 1.03, 100)}%`,
    backgroundColor: `hsl(${(castPowerRef.current / 100) * 120}, 80%, 70%)`,
    transition: phase === 'casting' ? 'none' : 'height 0.1s linear, background-color 0.1s linear',
    borderRadius: 2,
  }}
/>
        </div>
      </div>
    )}


      {(phase === 'waiting' || phase === 'ready') && (
        <div className="text-center space-y-1">
          <p className={`font-bold ${feedbackColorClass}`}>{feedback}</p>
          <p>
            {phase === 'waiting'
              ? 'Waiting for a bite…'
              : 'Fish is biting! Press space quickly!'}
          </p>
        </div>
      )}

      {phase === 'in-minigame' && fishPreview && (
        <FishingMinigame
          fish={fishPreview}
          onResult={onResult}
          biteTime={biteTime}
          castBonus={castBonusRef.current}
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