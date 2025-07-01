import { useEffect, useRef, useState } from 'react'

type Fish = {
  stamina: number
  tugStrength: number
  changeRate: number
  changeStrength: number
  barType:
    | 'middle'
    | 'middleSmall'
    | 'low'
    | 'high'
    | 'double'
    | 'dynamicSmall'
    | 'dynamicMedium'
    | 'dynamicLarge'
}

type Zone = { left: number; width: number; color: string }

type FishingMinigameProps = {
  fish: Fish
  onResult: (result: 'caught' | 'escaped') => void
  onZoneColorChange?: (color: 'green' | 'yellow' | 'red') => void
  playerFocus: number
  playerLineTension: number
  castBonus?: number
  reactionBonus?: number
  isResource: boolean
}

export function FishingMinigame({
  fish,
  onResult,
  onZoneColorChange,
  playerFocus,
  playerLineTension,
  castBonus = 0,
  reactionBonus = 0,
}: FishingMinigameProps) {
  if (!fish || typeof fish.stamina !== 'number') return null
  const [stamina, setStamina] = useState(0)
  const [balance, setBalance] = useState(50)
  const [focus, setFocus] = useState(playerFocus)
  const [tugDirection, setTugDirection] = useState(Math.random() < 0.5 ? -1 : 1)
  const [dynamicZones, setDynamicZones] = useState<Zone[]>([])
  const [lineTension, setLineTension] = useState(0)
  const [snapped, setSnapped] = useState(false)

  const keys = useRef({ left: false, right: false })
  const effectiveTugRef = useRef(0)
  const directionRef = useRef(Math.random() < 0.5 ? 1 : -1)
  const balanceRef = useRef(balance)
  const focusRef = useRef(focus)
  const staminaRef = useRef(stamina)
  const tugDirectionRef = useRef(tugDirection)
  const lineTensionRef = useRef(lineTension)
  const reactedRef = useRef(false)

  const startTimeRef = useRef(Date.now())

useEffect(() => {
  balanceRef.current = 50
  setBalance(50)

  staminaRef.current = 0
  setStamina(0)

  focusRef.current = playerFocus
  setFocus(playerFocus)

  tugDirectionRef.current = Math.random() < 0.5 ? 1 : -1
  setTugDirection(tugDirectionRef.current)

  lineTensionRef.current = 0
  setLineTension(0)

  setSnapped(false)
}, [fish, playerFocus])

useEffect(() => {
  startTimeRef.current = Date.now()
}, [fish.barType])

useEffect(() => {
  setStamina((s) =>
    Math.min(fish.stamina, s + castBonus + reactionBonus)
  )
}, [castBonus, reactionBonus, fish.stamina])


  useEffect(() => {
  reactedRef.current = false
}, [fish])

  useEffect(() => {
    balanceRef.current = balance
    focusRef.current = focus
    staminaRef.current = stamina
    tugDirectionRef.current = tugDirection
    lineTensionRef.current = lineTension
  }, [balance, focus, stamina, tugDirection, lineTension])

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

  const calcDynamicZones = (barType: Fish['barType'], time: number): Zone[] => {
    let center = 50
    let yellowSize = 0
    let greenSize = 0
    const direction = directionRef.current
    const elapsed = (time - startTimeRef.current) / 1000

    switch (barType) {
      case 'dynamicSmall':
        center += 30 * Math.sin(elapsed) * direction
        yellowSize = 10
        greenSize = 10
        break
      case 'dynamicMedium':
        center += 30 * Math.sin(elapsed) * direction
        yellowSize = 15
        greenSize = 20
        break
      case 'dynamicLarge':
        center += 30 * Math.sin(elapsed) * direction
        yellowSize = 20
        greenSize = 30
        break
      default:
        return []
    }
    const totalSize = yellowSize * 2 + greenSize
    const minCenter = totalSize / 2
    const maxCenter = 100 - totalSize / 2
    const clampedCenter = Math.min(maxCenter, Math.max(minCenter, center))

    return [
      { left: 0, width: Math.max(0, clampedCenter - totalSize / 2), color: '#dc2626' }, // red left
      { left: Math.max(0, clampedCenter - totalSize / 2), width: yellowSize, color: '#facc15' }, // yellow left
      { left: Math.max(0, clampedCenter - totalSize / 2 + yellowSize), width: greenSize, color: '#22c55e' }, // green
      { left: Math.max(0, clampedCenter - totalSize / 2 + yellowSize + greenSize), width: yellowSize, color: '#facc15' }, // yellow right
      { left: Math.min(100, clampedCenter + totalSize / 2), width: Math.max(0, 100 - (clampedCenter + totalSize / 2)), color: '#dc2626' }, // red right
    ]
  }

  useEffect(() => {
    if (!fish.barType || !fish.barType.startsWith('dynamic')) return

    const interval = setInterval(() => {
      const time = Date.now()
      const zones = calcDynamicZones(fish.barType, time)
      setDynamicZones(zones)
    }, 50)

    return () => clearInterval(interval)
  }, [fish.barType])

  const getZones = (): Zone[] => {
    switch (fish.barType) {
      case 'middle':
        return [
          { left: 0, width: 15, color: '#dc2626' },
          { left: 15, width: 20, color: '#facc15' },
          { left: 35, width: 30, color: '#22c55e' },
          { left: 65, width: 20, color: '#facc15' },
          { left: 85, width: 15, color: '#dc2626' },
        ]

      case 'middleSmall':
        return [
          { left: 0, width: 25, color: '#dc2626' },
          { left: 25, width: 15, color: '#facc15' },
          { left: 40, width: 20, color: '#22c55e' },
          { left: 60, width: 15, color: '#facc15' },
          { left: 75, width: 25, color: '#dc2626' },
        ]

      case 'low':
        return [
          { left: 0, width: 20, color: '#dc2626' },
          { left: 20, width: 25, color: '#22c55e' },
          { left: 45, width: 15, color: '#facc15' },
          { left: 60, width: 40, color: '#dc2626' },
        ]

      case 'high':
        return [
          { left: 0, width: 40, color: '#dc2626' },
          { left: 40, width: 15, color: '#facc15' },
          { left: 55, width: 25, color: '#22c55e' },
          { left: 80, width: 20, color: '#dc2626' },
        ]

      case 'double':
        return [
          { left: 0, width: 15, color: '#dc2626' },
          { left: 15, width: 15, color: '#22c55e' },
          { left: 30, width: 15, color: '#facc15' },
          { left: 45, width: 10, color: '#dc2626' },
          { left: 55, width: 15, color: '#facc15' },
          { left: 70, width: 15, color: '#22c55e' },
          { left: 85, width: 15, color: '#dc2626' },
        ]

      case 'dynamicSmall':
      case 'dynamicMedium':
      case 'dynamicLarge':
        return dynamicZones.length ? dynamicZones : calcDynamicZones(fish.barType, Date.now())

      default:
        return [
          { left: 0, width: 15, color: '#dc2626' },
          { left: 15, width: 20, color: '#facc15' },
          { left: 35, width: 30, color: '#22c55e' },
          { left: 65, width: 20, color: '#facc15' },
          { left: 85, width: 15, color: '#dc2626' },
        ]
    }
  }

  const getZoneColorAtBalance = (balanceVal: number): 'green' | 'yellow' | 'red' => {
    const zones = getZones()
    for (const zone of zones) {
      if (balanceVal >= zone.left && balanceVal <= zone.left + zone.width) {
        if (zone.color === '#22c55e') return 'green'
        if (zone.color === '#facc15') return 'yellow'
        return 'red'
      }
    }
    return 'red'
  }

  const getStaminaGain = (balanceVal: number, barType: Fish['barType']): number => {
    if (barType?.startsWith('dynamic')) {
      const zones = getZones()
      for (const zone of zones) {
        if (balanceVal >= zone.left && balanceVal <= zone.left + zone.width) {
          if (zone.color === '#22c55e') return 1
          if (zone.color === '#facc15') return 0.3
          return -0.5
        }
      }
      return -0.5
    }

    switch (barType) {
      case 'middle':
        if (balanceVal >= 35 && balanceVal <= 65) return 1
        if (balanceVal <= 15 || balanceVal >= 85) return -0.5
        return 0.3

      case 'middleSmall':
        if (balanceVal >= 40 && balanceVal <= 60) return 1
        if (balanceVal <= 25 || balanceVal >= 75) return -0.5
        return 0.3

      case 'low':
        if (balanceVal < 20) return -0.5
        if (balanceVal >= 20 && balanceVal < 45) return 1
        if (balanceVal >= 45 && balanceVal < 60) return 0.3
        return -0.5

      case 'high':
        if (balanceVal < 40) return -0.5
        if (balanceVal >= 40 && balanceVal < 55) return 0.3
        if (balanceVal >= 55 && balanceVal < 80) return 1
        return -0.5

      case 'double':
        if (balanceVal < 15) return -0.5
        if (balanceVal >= 15 && balanceVal < 30) return 1
        if (balanceVal >= 30 && balanceVal < 45) return 0.3
        if (balanceVal >= 45 && balanceVal < 55) return -0.5
        if (balanceVal >= 55 && balanceVal < 70) return 0.3
        if (balanceVal >= 70 && balanceVal < 85) return 1
        return -0.5

      default:
        return 0.3
    }
  }

  useEffect(() => {
    if (snapped) return
console.log({
  tugDirection: tugDirectionRef.current,
  effectiveTug: effectiveTugRef.current,
  fishTugStrength: fish.tugStrength,
  keys: keys.current,
  balance: balanceRef.current,
})

    const interval = setInterval(() => {
      const inputDir =
        keys.current.left && !keys.current.right
          ? -1
          : keys.current.right && !keys.current.left
          ? 1
          : 0

      const currentFocus = focusRef.current
      const currentBalance = balanceRef.current
      const currentStamina = staminaRef.current
      const currentFishTug = tugDirectionRef.current
      const currentLineTension = lineTensionRef.current

      const blendSpeed = 0.3
      const focusDrain = inputDir !== 0 ? -6.6 : 18

      const newFocus = Math.max(0, Math.min(playerFocus, currentFocus + focusDrain))
      const tensionMultiplier = 100 / playerLineTension

      const playerTugStrength = newFocus === 0 ? 67.5 : 135
      const playerTugWeight = playerTugStrength / fish.tugStrength
      const desiredTug = currentFishTug + inputDir * playerTugWeight
      const clampedDesiredTug = Math.max(-1, Math.min(1, desiredTug))

      effectiveTugRef.current += (clampedDesiredTug - effectiveTugRef.current) * blendSpeed

      const fishTugPerTick = 2
      const pullForce = fishTugPerTick * effectiveTugRef.current * 1.5

      let newBalance = currentBalance + pullForce
      newBalance = Math.max(0, Math.min(100, newBalance))

      const currentZoneColor = getZoneColorAtBalance(newBalance)
      onZoneColorChange?.(currentZoneColor)

      let newLineTension = currentLineTension
      if (currentZoneColor === 'green') {
        newLineTension = Math.max(0, currentLineTension - 1 * tensionMultiplier)
      } else if (currentZoneColor === 'yellow') {
        newLineTension = Math.min(100, currentLineTension + 1.5 * tensionMultiplier)
      } else {
        newLineTension = Math.min(100, currentLineTension + 4.5 * tensionMultiplier)
      }

      if (newLineTension >= 100) {
        setSnapped(true)
        onResult('escaped')
      }

      const staminaGain = getStaminaGain(newBalance, fish.barType)
      let newStamina = Math.max(0, Math.min(fish.stamina, currentStamina + staminaGain))

      setFocus(newFocus)
      setBalance(newBalance)
      setStamina(newStamina)
      setLineTension(newLineTension)
    }, 100)

    return () => clearInterval(interval)
  }, [fish, onResult, snapped, onZoneColorChange, castBonus, reactionBonus, playerFocus, playerLineTension])

  useEffect(() => {
    let animationFrame: number
    let phaseStart = Date.now()
    let phase = 'hold'

    const baseTransitionDuration = 200
    const holdMultiplier = 200 / fish.changeRate
    const transitionMultiplier = 200 / fish.changeRate

    const getHoldInterval = () => {
      const min = 500 * holdMultiplier
      const max = 2250 * holdMultiplier
      return min + Math.random() * (max - min)
    }

    let holdInterval = getHoldInterval()
    let startDirection = tugDirectionRef.current
    let targetDirection = tugDirectionRef.current
    let directionBias = 0

    const smoothstep = (t: number) => t * t * (3 - 2 * t)

    const step = () => {
      const now = Date.now()
      const elapsed = now - phaseStart

      if (phase === 'hold') {
        const sway = Math.sin(now / 300) * 0.2
        setTugDirection(startDirection + sway)

        if (elapsed >= holdInterval) {
          const biasFactor = Math.random() + directionBias * 0.5
          targetDirection = biasFactor > 0.6 ? 1 : biasFactor < 0.4 ? -1 : startDirection
          directionBias = Math.max(-1, Math.min(1, directionBias + targetDirection * 0.05))

          phase = 'transition'
          phaseStart = now
        }
      } else if (phase === 'transition') {
        const transitionDuration = baseTransitionDuration * transitionMultiplier
        const progress = Math.min(elapsed / transitionDuration, 1)
        const easedProgress = smoothstep(progress)
        const newDir = startDirection + (targetDirection - startDirection) * easedProgress

        if (progress > 0.9) setTugDirection(targetDirection * (fish.changeStrength / 100))
        else setTugDirection(newDir * (fish.changeStrength / 100))

        if (progress >= 1) {
          startDirection = targetDirection
          phase = 'hold'
          phaseStart = now
          holdInterval = getHoldInterval()
        }
      }

      animationFrame = requestAnimationFrame(step)
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [fish.changeRate, fish.changeStrength])

  useEffect(() => {
    if (stamina >= fish.stamina) {
      onResult('caught')
    }
    if (balance <= 0 || balance >= 100) {
      onResult('escaped')
    }
  }, [stamina, balance, fish.stamina, onResult])

  const zones = getZones()

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

      <div
        style={{
          marginTop: 16,
          position: 'relative',
          height: 20,
          borderRadius: 4,
          background: '#eee',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <strong style={{ position: 'absolute', top: -20, left: 0, fontWeight: 'bold', color: 'black' }}>
          Balance
        </strong>

        {zones.map((zone, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${zone.left}%`,
              width: `${zone.width}%`,
              background: zone.color,
              transition: fish.barType?.startsWith('dynamic') ? 'left 0.05s linear, width 0.05s linear' : undefined,
            }}
          />
        ))}
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
        <p style={{ fontSize: 12, position: 'absolute', bottom: -20, right: 0, margin: 0, color: 'black' }}>
          Balance: {balance.toFixed(1)}
        </p>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Focus</strong>
        <div style={{ background: '#ddd', height: 12, borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(focus / playerFocus) * 100}%`,
              height: '100%',
              background: 'orange',
              transition: 'width 0.2s',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Line Tension</strong>
        <div style={{ background: '#ddd', height: 12, borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(lineTension / 100) * 100}%`,
              height: '100%',
              background: snapped ? 'red' : '#ef4444',
              transition: 'width 0.2s',
            }}
          />
        </div>
        {snapped && <p style={{ color: 'red', margin: 0, fontWeight: 'bold' }}>Line snapped!</p>}
      </div>

      <div style={{ marginTop: 16 }}>
        <p>
          <strong>Fish is tugging</strong>: {tugDirectionRef.current < 0 ? '←' : '→'}
        </p>
        <p>Hold A/D to adjust!</p>
      </div>
    </div>
  )
}