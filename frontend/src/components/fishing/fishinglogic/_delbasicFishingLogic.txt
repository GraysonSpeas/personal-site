import { useEffect, useState } from 'react'
import { API_BASE } from '../../../config'

export function FishingButton({ refetch }: { refetch: () => void }) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'ready' | 'error'>('idle')
  const [fishPreview, setFishPreview] = useState<{
    species: string
    rarity: string
    stamina?: number
    tug_strength?: number
  } | null>(null)
  const [caughtFish, setCaughtFish] = useState<{
    species: string
    rarity: string
    stamina?: number
    tug_strength?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startFishing() {
    setStatus('waiting')
    setError(null)
    setCaughtFish(null)

    try {
      const res = await fetch(`${API_BASE}/minigame/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to start fishing')

      const json = await res.json()
      setFishPreview(json.fishPreview)

      await new Promise((r) => setTimeout(r, json.biteDelay))
      setStatus('ready')
    } catch (e: any) {
      setStatus('error')
      setError(e.message || 'Unknown error')
    }
  }

  async function catchFish() {
    setStatus('idle')
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/minigame/catch`, {
        method: 'POST',
        credentials: 'include',
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to catch fish')

      setCaughtFish(json.fish || null)

      if (refetch && typeof refetch === 'function') {
        await refetch()
      }
    } catch (e: any) {
      setStatus('error')
      setError(e.message || 'Unknown error')
    } finally {
      setFishPreview(null)
    }
  }

  useEffect(() => {
    if (status === 'ready') {
      const timeout = setTimeout(() => {
        setStatus('idle')
        setFishPreview(null)
      }, 15000)
      return () => clearTimeout(timeout)
    }
  }, [status])

  return (
    <div>
      {status === 'idle' && <button onClick={startFishing}>Fish</button>}
      {status === 'waiting' && <p>Waiting for a bite...</p>}
      {status === 'ready' && <button onClick={catchFish}>Catch the fish!</button>}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {error}</p>}

      {fishPreview && (
        <p>
          Fish preview: {fishPreview.species} ({fishPreview.rarity})<br />
          Stamina: {fishPreview.stamina} | Tug Strength: {fishPreview.tug_strength}
        </p>
      )}

      {caughtFish && (
        <p>
          Caught fish: {caughtFish.species} ({caughtFish.rarity})<br />
          Stamina: {caughtFish.stamina} | Tug Strength: {caughtFish.tug_strength}
        </p>
      )}
    </div>
  )
}