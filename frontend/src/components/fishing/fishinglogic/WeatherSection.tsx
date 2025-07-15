import { WeatherUI } from '../fishingui/WeatherUI';
import type { WorldState } from '../fishinglogic/TimeContentProvider';

export function WeatherSection({ weather, worldState }: { weather: string; worldState?: WorldState }) {
  return (
    <section className="mb-4">
      <WeatherUI weather={weather} worldState={worldState} />
    </section>
  );
}