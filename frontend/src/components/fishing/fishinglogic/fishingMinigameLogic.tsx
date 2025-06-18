import { useEffect, useRef, useState } from 'react'

export function FishingMinigame({
  fish,
  onResult,
}: {
  fish: { stamina: number; tug_strength: number; direction_change_rate?: number }
  onResult: (result: 'caught' | 'escaped') => void
}) {
  // State variables for stamina, balance, focus, and fish tug direction
  const [stamina, setStamina] = useState(0)
  const [balance, setBalance] = useState(50)       // Balance starts centered at 50
  const [focus, setFocus] = useState(50)           // Focus max and start at 50
  const [direction, setDirection] = useState<'left' | 'right'>('left')

  // Track key presses (A/D) for input
  const keys = useRef({ left: false, right: false })
  const loopRef = useRef<number | null>(null)
  const directionTimerRef = useRef<number | null>(null)

  // Returns current user input direction or null
  const getInput = () => {
    if (keys.current.left && !keys.current.right) return 'left'
    if (keys.current.right && !keys.current.left) return 'right'
    return null
  }

  // Listen for keydown/up events and update keys pressed state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a') keys.current.left = true
      if (e.key === 'd') keys.current.right = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a') keys.current.left = false
      if (e.key === 'd') keys.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Automatically change fish tug direction every delay based on rate
  useEffect(() => {
    const changeDirection = () => {
      setDirection((d) => (d === 'left' ? 'right' : 'left'))

      const rate = fish.direction_change_rate ?? 100
      const delay = (rate / 100) * 5000     // Scale delay by direction_change_rate
      directionTimerRef.current = window.setTimeout(changeDirection, delay)
    }

    directionTimerRef.current = window.setTimeout(changeDirection, 2000) // Initial delay
    return () => {
      if (directionTimerRef.current) clearTimeout(directionTimerRef.current)
    }
  }, [fish.direction_change_rate])

  // Main game loop running every 100ms: update focus, balance, stamina
  useEffect(() => {
    loopRef.current = window.setInterval(() => {
      const input = getInput()

      // Update focus:
      // Holding key drains focus by 1.5 per tick, releasing restores by 3 per tick
      const focusDrain = input ? -1.5 : 3
      setFocus((prev) => Math.max(0, Math.min(50, prev + focusDrain)))  // Clamp 0-50

      // Player tug strength depends on focus: 150 when focus>0, else 50
      const playerTugStrength = focus === 0 ? 50 : 150
      const playerTugPerTick = (playerTugStrength / 100) * 1

      // Fish tug strength scaled per tick (1 = 100 strength)
      const fishTugPerTick = (fish.tug_strength / 100) * 1

      // Update balance:
      // Fish pulls left/right depending on direction
      // Player input adjusts balance tug accordingly
      setBalance((b) => {
        let delta = direction === 'left' ? -fishTugPerTick : fishTugPerTick

        if (input === 'left') delta -= playerTugPerTick
        if (input === 'right') delta += playerTugPerTick

        return Math.max(0, Math.min(100, b + delta))  // Clamp between 0 and 100
      })

      // Update stamina:
      // Gain stamina when balance near center (35-65)
      // Lose stamina when balance near edges (≤15 or ≥85)
      setStamina((s) => {
        let gain = 0
        if (balance >= 35 && balance <= 65) gain = 1
        else if (balance <= 15 || balance >= 85) gain = -1
        return Math.max(0, Math.min(fish.stamina, s + gain))
      })
    }, 100)

    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [fish, direction, focus, balance])

  // Check win/loss conditions and report result
  useEffect(() => {
    if (stamina >= fish.stamina) onResult('caught')
    if (balance <= 0 || balance >= 100) onResult('escaped')
  }, [stamina, balance, fish.stamina, onResult])

  return (
  <div style={{ width: 300, padding: 12, background: '#f8fafc', borderRadius: 8, color: 'black' }}>
    {/* Stamina bar */}
    <div>
      <strong>Stamina</strong>
      <div style={{ background: '#ddd', height: 20, borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${(stamina / fish.stamina) * 100}%`,
            height: '100%',
            background: '#16a34a',
            transition: 'width 0.2s',
          }}
        />
      </div>
      <p style={{ fontSize: 12 }}>
        {stamina.toFixed(0)} / {fish.stamina}
      </p>
    </div>

    {/* Balance bar with colored zones */}
    <div style={{ marginTop: 16 }}>
      <strong>Balance</strong>
      <div style={{ position: 'relative', height: 20, borderRadius: 4, background: '#eee' }}>
        {/* Danger zones */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '15%',
            background: '#dc2626',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '15%',
            width: '20%',
            background: '#facc15',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '35%',
            width: '30%',
            background: '#22c55e',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '65%',
            width: '20%',
            background: '#facc15',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '85%',
            width: '15%',
            background: '#dc2626',
            zIndex: 0,
          }}
        />

        {/* Balance cursor */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 12,
            left: `calc(${balance}% - 6px)`,
            background: '#3b82f6',
            borderRadius: 3,
            zIndex: 2,
            transition: 'left 0.1s linear',
          }}
        />
      </div>
      <p style={{ fontSize: 12 }}>Balance: {balance.toFixed(1)}</p>
    </div>

    {/* Focus bar below balance */}
    <div style={{ marginTop: 8 }}>
      <strong>Focus</strong>
      <div style={{ background: '#ddd', height: 12, borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${(focus / 50) * 100}%`,
            height: '100%',
            background: 'orange',
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>

    {/* Fish tug direction and instructions */}
    <div style={{ marginTop: 16 }}>
      <p>
        <strong>Fish is tugging</strong>: {direction === 'left' ? '⬅️ Left' : '➡️ Right'}
      </p>
      <p>Hold A/D to adjust!</p>
    </div>
  </div>
)
}