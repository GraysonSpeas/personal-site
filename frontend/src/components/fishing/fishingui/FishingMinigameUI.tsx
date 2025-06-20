import { useEffect, useState, useRef } from 'react'
import { API_BASE } from '../../../config'
import { FishingMinigame } from '../fishinglogic/fishingMinigameLogic'

export function FishingMinigameUI({ refetch }: { refetch: () => void }) {
  type Phase = 'idle' | 'waiting' | 'ready' | 'in-minigame' | 'success' | 'failed'

  const [phase, setPhase] = useState<Phase>('idle')
  const [fishPreview, setFishPreview] = useState<null | {
    species: string
    rarity: string
    stamina: number
    tug_strength: number
    direction_change_rate?: number
  }>(null)
  const [caughtFish, setCaughtFish] = useState<null | {
    species: string
    rarity: string
    stamina: number
    tug_strength: number
  }>(null)
  const [error, setError] = useState<string | null>(null)

  const caughtCalledRef = useRef(false)

  async function startFishing() {
    setPhase('waiting')
    setError(null)
    setCaughtFish(null)
    caughtCalledRef.current = false

    try {
      const res = await fetch(`${API_BASE}/minigame/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to start fishing')

      const json = await res.json()
      setFishPreview(json.fishPreview)

      await new Promise((r) => setTimeout(r, json.biteDelay + 200))
      setPhase('ready')
    } catch (e: any) {
      setPhase('idle')
      setError(e.message || 'Unknown error')
    }
  }

  async function catchFish() {
    setPhase('in-minigame')
    setError(null)
  }

  async function onResult(result: 'caught' | 'escaped') {
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
        if (!res.ok) throw new Error(json.error || 'Failed to catch fish')

        setCaughtFish(json.fish)
        setPhase('success')
        await refetch()
      } catch (e: any) {
        setError(e.message || 'Unknown error')
        setPhase('failed')
      }
    } else {
      setPhase('failed')
    }

    setFishPreview(null)
  }

  function reset() {
    setPhase('idle')
    setCaughtFish(null)
    setError(null)
    caughtCalledRef.current = false
  }

  return (
    <div>
      {phase === 'idle' && <button onClick={startFishing}>Fish</button>}

      {phase === 'waiting' && <p>Waiting for a bite...</p>}

      {phase === 'ready' && <button onClick={catchFish}>Catch the fish!</button>}

      {phase === 'in-minigame' && fishPreview && (
        <FishingMinigame fish={fishPreview} onResult={onResult} />
      )}

      {phase === 'success' && caughtFish && (
        <div>
          <p>
            🎉 You caught a {caughtFish.species} ({caughtFish.rarity})!
          </p>
          <button onClick={reset}>Catch Again</button>
        </div>
      )}

      {phase === 'failed' && (
        <div>
          <p>😢 The fish got away.</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  )
}