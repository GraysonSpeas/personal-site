import { useEffect, useRef, useState } from 'react'

export function FishingMinigame({
  fish,
  onResult,
}: {
  fish: { stamina: number; tug_strength: number; direction_change_rate?: number }
  onResult: (result: 'caught' | 'escaped') => void
}) {
  const [stamina, setStamina] = useState(0)
  const [balance, setBalance] = useState(50)
  const [focus, setFocus] = useState(100)
  const [tugDirection, setTugDirection] = useState(1) // fish tug direction (-1 to 1)

  const keys = useRef({ left: false, right: false })
  const loopRef = useRef<number | null>(null)

  // For blending tug direction smoothly over time
  const effectiveTugRef = useRef(0) // -1 to 1, blends fish tug & player input

  // Keep refs updated for latest states inside intervals
  const balanceRef = useRef(balance)
  const focusRef = useRef(focus)
  const staminaRef = useRef(stamina)
  const tugDirectionRef = useRef(tugDirection)

  useEffect(() => { balanceRef.current = balance }, [balance])
  useEffect(() => { focusRef.current = focus }, [focus])
  useEffect(() => { staminaRef.current = stamina }, [stamina])
  useEffect(() => { tugDirectionRef.current = tugDirection }, [tugDirection])

  const getInput = () => {
    if (keys.current.left && !keys.current.right) return -1
    if (keys.current.right && !keys.current.left) return 1
    return 0
  }

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

  useEffect(() => {
    let animationFrame: number
    let phaseStart = Date.now()
    let phase = 'hold'

    const holdMin = 7000
    const holdMax = 10000
    const transitionDuration = 3000

    const rate = fish.direction_change_rate ?? 100

    // Helper to calc a new randomized hold interval for each hold phase
    const getHoldInterval = () =>
      holdMin + (holdMax - holdMin) * (1 - rate / 100) * (0.8 + Math.random() * 0.4)

    let holdInterval = getHoldInterval()

    let startDirection = tugDirectionRef.current
    let targetDirection = tugDirectionRef.current

    const step = () => {
      const now = Date.now()
      const elapsed = now - phaseStart

      if (phase === 'hold') {
        // recalc holdInterval on phase start
        if (elapsed < 100) holdInterval = getHoldInterval()

        if (elapsed >= holdInterval) {
          if (Math.random() < 0.5) targetDirection = startDirection === 1 ? -1 : 1
          else targetDirection = startDirection
          phase = 'transition'
          phaseStart = now
        }
        setTugDirection(startDirection)
      } else if (phase === 'transition') {
        const progress = Math.min(elapsed / transitionDuration, 1)
        const newDir = startDirection + (targetDirection - startDirection) * progress
        setTugDirection(newDir)

        if (progress >= 1) {
          startDirection = targetDirection
          phase = 'hold'
          phaseStart = now
        }
      }

      animationFrame = requestAnimationFrame(step)
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [fish.direction_change_rate])

  useEffect(() => {
    loopRef.current = window.setInterval(() => {
      const inputDir = getInput() // -1, 0, or 1

      const currentFocus = focusRef.current
      const currentBalance = balanceRef.current
      const currentStamina = staminaRef.current
      const currentFishTug = tugDirectionRef.current

      // Smooth blend factor, adjust for smoothness
      const blendSpeed = 0.3

      // Adjust focus
      const focusDrain = inputDir !== 0 ? -3.3 : 9
      const newFocus = Math.max(0, Math.min(50, currentFocus + focusDrain))

      // Tug strengths
      const playerTugStrength = newFocus === 0 ? 20 : 90
      const safeFishTugStrength = Math.max(fish.tug_strength, 1)

      // Player tug influence scaled by ratio of player to fish strength
      const playerTugWeight = (playerTugStrength / safeFishTugStrength) * 1.5

      // Desired tug blends fish tug + player tug input weighted
      const desiredTug = currentFishTug + inputDir * playerTugWeight

      // Clamp desired tug between -1 and 1
      const clampedDesiredTug = Math.max(-1, Math.min(1, desiredTug))

      // Smoothly interpolate effective tug toward desired tug
      effectiveTugRef.current += (clampedDesiredTug - effectiveTugRef.current) * blendSpeed

      // Fish tug per tick fixed
      const fishTugPerTick = 2

      // Pull force applied to balance from effective tug
      const pullForce = fishTugPerTick * effectiveTugRef.current *1.5

      // Update balance
      let newBalance = currentBalance + pullForce
      newBalance = Math.max(0, Math.min(100, newBalance))

      // Stamina gain/loss zones
      let staminaGain = 0
      if (newBalance >= 35 && newBalance <= 65) staminaGain = 0.7
      else if (newBalance <= 15 || newBalance >= 85) staminaGain = -0.7

      let newStamina = Math.max(0, Math.min(fish.stamina, currentStamina + staminaGain))

      // Update states
      setFocus(newFocus)
      setBalance(newBalance)
      setStamina(newStamina)
    }, 100)

    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [fish])

  useEffect(() => {
    if (stamina >= fish.stamina) onResult('caught')
    if (balance <= 0 || balance >= 100) onResult('escaped')
  }, [stamina, balance, fish.stamina, onResult])

  return (
    <div style={{ width: 300, padding: 12, background: '#f8fafc', borderRadius: 8, color: 'black' }}>
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

      <div style={{ marginTop: 16 }}>
        <strong>Balance</strong>
        <div style={{ position: 'relative', height: 20, borderRadius: 4, background: '#eee' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '15%', background: '#dc2626' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '15%', width: '20%', background: '#facc15' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '35%', width: '30%', background: '#22c55e' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '65%', width: '20%', background: '#facc15' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '85%', width: '15%', background: '#dc2626' }} />
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

      <div style={{ marginTop: 16 }}>
        <p>
          <strong>Fish is tugging</strong>: {tugDirection ? '⬅️ Left' : '➡️ Right'}
        </p>
        <p>Hold A/D to adjust!</p>
      </div>
    </div>
  )
}