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
  const [error, setError] = useState<string | null>(null)

  async function startFishing() {
    setStatus('waiting')
    setError(null)

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
  console.log('catchFish started')
  setStatus('idle')
  setError(null)

  try {
    const res = await fetch(`${API_BASE}/minigame/catch`, {
      method: 'POST',
      credentials: 'include',
    })
    console.log('Catch response status:', res.status)

    const json = await res.json()
    console.log('Catch response json:', json)

    if (!res.ok) throw new Error(json.error || 'Failed to catch fish')

    if (refetch && typeof refetch === 'function') {
      console.log('Calling refetch after catch')
      await refetch()
      console.log('Refetch finished')
    } else {
      console.log('Refetch not called: refetch is missing or not a function')
    }
  } catch (e: any) {
    setStatus('error')
    setError(e.message || 'Unknown error')
    console.error('Catch error:', e)
  } finally {
    setFishPreview(null)
    console.log('catchFish finished')
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
    </div>
  )
}