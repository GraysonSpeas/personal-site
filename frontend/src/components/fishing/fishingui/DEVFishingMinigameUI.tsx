import { useState } from 'react'
import { DEVFishingMinigame as FishingMinigame } from '../fishinglogic/DEVfishingMinigameLogic'

export function DEVFishingMinigameUI() {
  const [fishStamina, setFishStamina] = useState(150)
  const [tugStrength, setTugStrength] = useState(100)
  const [changeRate, setChangeRate] = useState(100)
  const [changeStrength, setChangeStrength] = useState(100)
  const [barType, setBarType] = useState<
    'middle' |'middleSmall' |'low' | 'high' | 'double' | 'dynamicSmall' | 'dynamicMedium' | 'dynamicLarge'
  >('middle')
  const [minigameKey, setMinigameKey] = useState(0)

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded space-y-2 text-black">
        <h2 className="font-bold text-black">Test Controls</h2>
        <div className="space-y-2">
          <div>
            <label className="mr-2 text-black">Fish Stamina:</label>
            <input
              type="number"
              value={fishStamina}
              onChange={(e) => setFishStamina(Number(e.target.value))}
              className="border px-2 py-1 w-24 text-black bg-white"
            />
          </div>
          <div>
            <label className="mr-2 text-black">Tug Strength:</label>
            <input
              type="number"
              value={tugStrength}
              onChange={(e) => setTugStrength(Number(e.target.value))}
              className="border px-2 py-1 w-24 text-black bg-white"
            />
          </div>
          <div>
            <label className="mr-2 text-black">Change Rate:</label>
            <input
              type="number"
              value={changeRate}
              onChange={(e) => setChangeRate(Number(e.target.value))}
              className="border px-2 py-1 w-24 text-black bg-white"
            />
          </div>
          <div>
            <label className="mr-2 text-black">Change Strength:</label>
            <input
              type="number"
              step="0.1"
              value={changeStrength}
              onChange={(e) => setChangeStrength(Number(e.target.value))}
              className="border px-2 py-1 w-24 text-black bg-white"
            />
          </div>
          <div>
            <label className="mr-2 text-black">Bar Type:</label>
            <select
              value={barType}
              onChange={(e) => setBarType(e.target.value as any)}
              className="border px-2 py-1 text-black bg-white"
            >
              <option value="middle">Middle</option>
              <option value="middleSmall">Middle Small</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="double">Double</option>
              <option value="dynamicSmall">Dynamic Small</option>
              <option value="dynamicMedium">Dynamic Medium</option>
              <option value="dynamicLarge">Dynamic Large</option>
            </select>
          </div>
          <button
            onClick={() => setMinigameKey((k) => k + 1)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Minigame
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded space-y-1 text-black">
        <h2 className="font-bold text-black">Current Settings</h2>
        <p>Fish Stamina: {fishStamina}</p>
        <p>Tug Strength: {tugStrength}</p>
        <p>Change Rate: {changeRate}</p>
        <p>Change Strength: {changeStrength}</p>
        <p>Bar Type: {barType}</p>
      </div>

      <FishingMinigame
        key={minigameKey}
        fish={{
          stamina: fishStamina,
          tugStrength: tugStrength,
          changeRate,
          changeStrength,
          barType,
        }}
        onResult={(r) => console.log('Result:', r)}
        biteTime={Date.now()}
        playerFocus={100} // Assuming player focus is 100 for testing
        playerLineTension={100} // Assuming player line tension is 0 for testing
      />
    </div>
  )
}