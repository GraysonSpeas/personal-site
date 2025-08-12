import { useEffect, useState, useRef, useCallback } from 'react'
import { API_BASE } from '../../../config'
import { FishingMinigame } from '../fishinglogic/fishingMinigameLogic'

export function FishingMinigameUI({
  refetchInventory,
  refetchTime,
  refetchMerchant,
  refetchCrafting,
  currentZoneId,
  setCurrentZoneId,
}: {
  refetchInventory: () => void;
  refetchTime: () => void;
  refetchMerchant: () => void;
  refetchCrafting: () => void;
  currentZoneId: number | null;
  setCurrentZoneId: (zoneId: number) => void;
}) {
  type Phase = 'idle' | 'casting' | 'waiting' | 'ready' | 'in-minigame' | 'success' | 'failed'

  const [phase, setPhase] = useState<Phase>('idle')
  const [fishPreview, setFishPreview] = useState<any>(null)
  useEffect(() => {
    console.log('Updated fishPreview:', fishPreview)
  }, [fishPreview])
  const [caughtFish, setCaughtFish] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoneChangeMessage, setZoneChangeMessage] = useState<string | null>(null)

  const [castPower, setCastPower] = useState(0)
  const castPowerRef = useRef(0)
  const castDirRef = useRef(1)
  const [feedback, setFeedback] = useState<'Perfect' | 'Good' | 'Ok' | 'Late'>('Ok')
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
  setZoneChangeMessage(null)
  caughtCalledRef.current = false
  setBiteTime(null)
  setReactionBonus(0)
  backendBiteDelayRef.current = 0

  try {
    const res = await fetch(`${API_BASE}/minigame/start`, {
      method: 'POST',
      credentials: 'include',
    })

    const text = await res.text()
    console.log('Raw response text:', text)

    let json: any = {}
    try {
      json = JSON.parse(text)
    } catch {
      console.error('Failed to parse JSON from response')
    }

    console.log('Response status:', res.status, 'json:', json)

if (!res.ok) {
  if (json.movedToZone && json.message) {
    setZoneChangeMessage(json.message);
    setCurrentZoneId(json.movedToZone);
  } else {
    setError(json.message || 'Failed to start');
  }
  setPhase('idle');
  return;
}

    setFishPreview(json.fishPreview)
    backendBiteDelayRef.current = json.biteDelay || 4000
  } catch (e: any) {
    setPhase('idle')
    setError(e.message)
  }
}


  const handleCast = () => {
    let bonus = 0
    let txt: 'Perfect' | 'Good' | 'Ok' | 'Late' = 'Late'

    const power = castPowerRef.current

    if (power >= 95) {
      bonus = 20
      txt = 'Perfect'
    } else if (power >= 85) {
      bonus = 10
      txt = 'Good'
    } else if (power >= 60) {
      bonus = 5
      txt = 'Ok'
    }

    setFeedback(txt)
    setCastBonus(bonus)
    setPhase('waiting')
    setBiteTime(Date.now() + backendBiteDelayRef.current)
  }

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
          if (!res.ok) throw new Error(json.error || 'Failed to catch')
          setCaughtFish(json.fish)
          setPhase('success')

          await refetchTime()
          await refetchInventory()
          await refetchMerchant()
          await refetchCrafting()
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
    [fishPreview, refetchInventory, refetchTime, refetchMerchant, refetchCrafting],
  )

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

  useEffect(() => {
    if (phase !== 'ready' || !biteTime) return

    reactionTimeoutRef.current = setTimeout(() => {
      onResult('escaped')
    }, 4000)

    return () => {
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current)
        reactionTimeoutRef.current = null
      }
    }
  }, [phase, biteTime, onResult])

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
      } else if (phase === 'success' || phase === 'failed') {
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
<div
  className="border-2 border-black rounded p-4"
  style={{ 
    width: 400, 
    height: 300, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16,
    alignItems: 'center', 
  }}
>
      {zoneChangeMessage && (
        <div className="bg-yellow-300 text-yellow-900 p-2 rounded mb-2 flex justify-between items-center">
          <span>{zoneChangeMessage}</span>
          <button
            onClick={() => setZoneChangeMessage(null)}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {phase === 'idle' && (
<button
  onClick={startFishing}
  className="mx-auto block"
  style={{
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    fontSize: 18,
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.6)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: 140,
  }}
  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
>
  <div>🎣Fish</div>
  <div
    style={{
      fontSize: 14,
      fontWeight: 'normal',
      marginTop: 6,
      background: 'rgba(255 255 255 / 0.3)',
      padding: '2px 6px',
      borderRadius: 8,
      userSelect: 'none',
      width: 'fit-content',
    }}
  >
    (Spacebar)
  </div>
</button>
)}

{phase === 'casting' && (
  <div className="w-16 mx-auto flex flex-col items-center">
    <button
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        fontSize: 18,
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
        color: 'white',
        border: 'none',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.6)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        width: 140,
      }}
      disabled
    >
      <div>Cast Line</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 'normal',
          marginTop: 6,
          background: 'rgba(255 255 255 / 0.3)',
          padding: '2px 6px',
          borderRadius: 8,
          userSelect: 'none',
          width: 'fit-content',
        }}
      >
        (Spacebar)
      </div>
    </button>
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

          <>
  <style>{`
    @keyframes pulse {
      0% { transform: scale(1); background-color: #fef3c7; }
      50% { transform: scale(1.05); background-color: #fde68a; }
      100% { transform: scale(1); background-color: #fef3c7; }
    }
  `}</style>

  <p
    style={{
      background: '#fef3c7',
      color: '#b45309',
      padding: '8px 12px',
      borderRadius: 6,
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
      border: '2px solid #f59e0b',
      animation: phase !== 'waiting' ? 'pulse 0.6s infinite' : undefined,
    }}
  >
    {phase === 'waiting'
      ? '🎣 Waiting for a bite…'
      : '🐟 Fish is biting! Press SPACEBAR quickly!'}
  </p>
</>
        </div>
      )}

      {phase === 'in-minigame' && fishPreview && (
        <FishingMinigame
          fish={fishPreview.data}
          onResult={onResult}
          castBonus={castBonus}
          reactionBonus={reactionBonus}
          playerFocus={fishPreview?.gearStats?.focus ?? 50}
          playerLineTension={fishPreview?.gearStats?.lineTension ?? 50}
          isResource={fishPreview.isResource}
        />
      )}

{phase === 'success' && caughtFish && (
  <div className="text-center space-y-3">
    <p
      style={{
        fontWeight: 'bold',
        fontSize: 18,
        margin: 0,
      }}
    >
      🎉 You caught a {caughtFish.species} ({caughtFish.rarity})!
    </p>
<button
  onClick={() => setPhase('idle')}
  className="mx-auto block"
  style={{
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #16a34a, #15803d)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    boxShadow: '0 3px 8px rgba(22, 163, 74, 0.6)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    width: 110,
  }}
  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
>
  <div style={{ fontSize: 18, fontWeight: 'bold' }}>Catch Again</div>
  <div
    style={{
      fontSize: 14,
      fontWeight: 'normal',
      marginTop: 4,
      background: 'rgba(255 255 255 / 0.3)',
      padding: '1px 4px',
      borderRadius: 6,
      userSelect: 'none',
      width: 'fit-content',
    }}
  >
    (Spacebar)
  </div>
</button>
  </div>
)}


{phase === 'failed' && (
  <div className="text-center space-y-3">
    <p
      style={{
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 18,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        margin: 0,
      }}
    >
      😢 The fish got away.
    </p>
<button
  onClick={() => setPhase('idle')}
  className="mx-auto block"
  style={{
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: 14, // keep for whole button container
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    boxShadow: '0 3px 8px rgba(245, 158, 11, 0.6)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    width: 140,
  }}
  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
>
  <div style={{ fontSize: 18, fontWeight: 'bold' }}>Try Again</div>
  <div
    style={{
      fontSize: 14,
      fontWeight: 'normal',
      marginTop: 4,
      background: 'rgba(255 255 255 / 0.3)',
      padding: '1px 4px',
      borderRadius: 6,
      userSelect: 'none',
      width: 'fit-content',
    }}
  >
    (Spacebar)
  </div>
</button>
  </div>
)}
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  )
}