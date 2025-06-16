// src/components/BasicFishingUI.tsx
import React from 'react'
import { FishingButton } from '../fishinglogic/basicFishingLogic'

type BasicFishingUIProps = {
  refetch: () => void
}

export function BasicFishingUI({ refetch }: BasicFishingUIProps) {
  return (
    <div>
      <h2>Fishing Minigame</h2>
      <FishingButton refetch={refetch} />
    </div>
  )
}
